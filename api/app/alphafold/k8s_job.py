from kubernetes import client
import shlex

from app.shared.job_submitting import generate_salt
from config import Config

def set_db_paths(modelPreset, jobConfig):
    """Set the database paths based on the model preset."""
    if modelPreset == "multimer":
        db_paths_cmd = (
            f'--pdb_seqres_database_path={jobConfig["pdbseq"]} '
            f'--uniprot_database_path={jobConfig["uniprot"]} ' 
        )
    else:
        db_paths_cmd = f'--pdb70_database_path={jobConfig["pdbdb"]} '

    return db_paths_cmd

def construct_command(jobConfig, user):
    simplename_quoted = shlex.quote(jobConfig["simplename"])
    user_quoted = shlex.quote(user)
    output_dir = f'/mnt/output/{user_quoted}/{simplename_quoted}'
    db_paths_cmd = set_db_paths(jobConfig["modelPreset"], jobConfig)
    salt = generate_salt()

    # Construct the command for running Alphafold and handling the output
    mkdir_cmd = f'mkdir -p {output_dir}'
    alphafold_cmd = (
        f'python /app/alphafold/run_alphafold.py '
        f'--fasta_paths={shlex.quote(jobConfig["input"])} '
        f'--uniref90_database_path={shlex.quote(jobConfig["uniref90"])} '
        f'--mgnify_database_path={shlex.quote(jobConfig["mgnify"])} '
        f'--data_dir={shlex.quote(jobConfig["data"])} '
        f'--template_mmcif_dir={shlex.quote(jobConfig["mmcif"])} '
        f'--obsolete_pdbs_path={shlex.quote(jobConfig["obsolete"])} '
        f'{db_paths_cmd}'
        f'{jobConfig["uniclust"]} {jobConfig["full"]} '
        f'--output_dir=/mnt/output/{user_quoted} '
        f'--max_template_date={shlex.quote(jobConfig["maxTemplateDate"])} '
        f'--db_preset={shlex.quote(jobConfig["dbPreset"])} '
        f'{jobConfig["reduced"]} '
        f'--model_preset={shlex.quote(jobConfig["modelPreset"])} '
        f'--benchmark=False '
        f'--use_precomputed_msas={jobConfig["reuseMSAs"]} '
        f'--num_multimer_predictions_per_model={shlex.quote(jobConfig["predictionsPerModel"])} '
        f'--models_to_relax={"all" if jobConfig["runRelax"] else "none"} '
        f'--use_gpu_relax=True '
        f'--logtostderr 2>&1 | tee {output_dir}/stdout'
    )
    public_symlink_cmd = (
        f'if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; '
        f'then ln -sfr {output_dir} /mnt/output/public/{simplename_quoted} ; fi'
    )
    readme_cmd = (
        f'if [ -f "{Config.README_ALPHAFOLD2}" ]; then '
        f'cp "{Config.README_ALPHAFOLD2}" {output_dir}/README.md; fi'
    )
    compression_cmd = (
        f'cd /mnt/output/{user_quoted}; '
        f'cp -r {simplename_quoted} /storage; '
        f'zip -0 -r {simplename_quoted}.zip {simplename_quoted}; '
        f'mv {simplename_quoted}.zip {simplename_quoted}/download-{salt}.zip'
    )
    create_done_file_cmd = (
        f'if [ -s "{output_dir}/ranking_debug.json" ] ; '
        f'then touch "{output_dir}/alphafold.done"; fi'
    )
    email_quoted = shlex.quote(jobConfig.get("email", ""))
    email_notification_cmd = (
        f'if [ ! -z {email_quoted} ]; '
        f'then if [ -s "{output_dir}/ranking_debug.json" ] ; '
        f'then echo -e "To:{email_quoted}\\nFrom:{shlex.quote(Config.EMAIL_FROM)}\\n'
        f'Subject:Alphafold computation has finished\\n\\n'
        f'Your AlphaFold computation {simplename_quoted} has finished, please visit {shlex.quote(Config.BASE_URL)}/result/{simplename_quoted} to view the result of your computation\\n" | ssmtp -t; '
        f'else echo -e '
        f'"To:{email_quoted}\\nFrom:{shlex.quote(Config.EMAIL_FROM)}\\n'
        f'Subject:Alphafold computation has failed\\n\\n'
        f'Your alphafold computation {simplename_quoted} has failed.\\n" '
        f'| cat - {output_dir}/stdout | ssmtp -t; exit 1; '
        f' fi; fi'
    )
    command = " && ".join([mkdir_cmd, alphafold_cmd, public_symlink_cmd, readme_cmd, compression_cmd, create_done_file_cmd, email_notification_cmd])

    return command

def create_alphafold2_k8s_config(jobConfig, user):
    """Create the Kubernetes job object."""

    # Construct the command for running Alphafold and handling the output
    arguments = construct_command(jobConfig, user)

    job = client.V1Job(
        api_version="batch/v1",
        kind="Job",
        metadata=client.V1ObjectMeta(
            name=jobConfig["uniquename"],
            annotations={"user": user, "simplename": jobConfig["simplename"], "public": jobConfig["makeResultsPublic"]}),
        spec=client.V1JobSpec(
            ttl_seconds_after_finished=100,
            backoff_limit=0,
            template=client.V1PodTemplateSpec(
                spec=client.V1PodSpec(
                    restart_policy="Never",
                    security_context=client.V1PodSecurityContext(
                        run_as_non_root=True,
                        seccomp_profile=client.V1SeccompProfile(type="RuntimeDefault"),
                        fs_group_change_policy="OnRootMismatch"
                    ),
                    containers=[
                        client.V1Container(
                            name=jobConfig["uniquename"],
                            image=Config.ALPHAFOLD_IMAGE_V2,
                            image_pull_policy="IfNotPresent",
                            command=["bash"],
                            args=["-c", 
                                  arguments],
                            env=[client.V1EnvVar(name="TF_FORCE_UNIFIED_MEMORY", value="1"), 
                                 client.V1EnvVar(name="XLA_PYTHON_CLIENT_MEM_FRACTION", value="4.0")],
                            security_context=client.V1SecurityContext(
                                run_as_user=1000,
                                run_as_group=1000,
                                allow_privilege_escalation=False,
                                capabilities=client.V1Capabilities(drop=["ALL"]),
                            ),
                            resources=client.V1ResourceRequirements(
                                requests={"cpu": "8", "memory": "49152Mi", "nvidia.com/gpu": "1"},
                                limits={"cpu": "8", "memory": "131072Mi", "nvidia.com/gpu": "1"}
                            ),
                            volume_mounts=[client.V1VolumeMount(name="vol-1", mount_path="/data"),
                                            client.V1VolumeMount(name="vol-2", mount_path="/mnt"),
                                            client.V1VolumeMount(name="dshm", mount_path="/dev/shm"),
                                            client.V1VolumeMount(name="storage", mount_path="/storage"),
                                            client.V1VolumeMount(name="ssmtp-config", mount_path="/etc/ssmtp", read_only=True)
                                            ],
                        )
                    ],
                    volumes=[client.V1Volume(name="vol-1", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL1_ALPHAFOLD)),
                             client.V1Volume(name="vol-2", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL2)),
                             client.V1Volume(name="dshm", empty_dir=client.V1EmptyDirVolumeSource(medium="Memory", size_limit="1Gi")),
                             client.V1Volume(name="storage", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_STORAGE)),
                             client.V1Volume(name="ssmtp-config", secret=client.V1SecretVolumeSource(secret_name=Config.SSMTP_SECRET, items=[client.V1KeyToPath(key="ssmtp.conf", path="ssmtp.conf")]))],
                )
            )
        )
    )
    
    return job