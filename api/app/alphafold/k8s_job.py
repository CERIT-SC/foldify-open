from kubernetes import client

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
    output_dir = f'/mnt/output/{user}/{jobConfig["simplename"]}'
    db_paths_cmd = set_db_paths(jobConfig["modelPreset"], jobConfig)
    salt = generate_salt()

    # Construct the command for running Alphafold and handling the output
    mkdir_cmd = f'mkdir -p {output_dir}'
    alphafold_cmd = (
        f'/app/alphafold/run_alphafold.py '
        f'--fasta_paths={jobConfig["input"]} '
        f'--uniref90_database_path={jobConfig["uniref90"]} '
        f'--mgnify_database_path={jobConfig["mgnify"]} '
        f'--data_dir={jobConfig["data"]} '
        f'--template_mmcif_dir={jobConfig["mmcif"]} '
        f'--obsolete_pdbs_path={jobConfig["obsolete"]} '
        f'{db_paths_cmd}'
        f'{jobConfig["uniclust"]} {jobConfig["full"]} '
        f'--output_dir=/mnt/output/{user} '
        f'--max_template_date={jobConfig["maxTemplateDate"]} '
        f'--db_preset={jobConfig["dbPreset"]} '
        f'{jobConfig["reduced"]} '
        f'--model_preset={jobConfig["modelPreset"]} '
        f'--benchmark=False '
        f'--use_precomputed_msas={jobConfig["reuseMSAs"]} '
        f'--num_multimer_predictions_per_model={jobConfig["predictionsPerModel"]} '
        f'--run_relax={jobConfig["runRelax"]} '
        f'--use_gpu_relax=True '
        f'--logtostderr 2>&1 | tee {output_dir}/stdout'
    )
    public_symlink_cmd = (
        f'if [ "{jobConfig["makeResultsPublic"]}" == "true" ] ; '
        f'then ln -sfr {output_dir} /mnt/output/public/{jobConfig["simplename"]} ; fi'
    )
    compression_cmd = (
        f'cd /mnt/output/{user}; '
        f'cp -r {jobConfig["simplename"]} /storage; '
        f'zip -0 -r {jobConfig["simplename"]}.zip {jobConfig["simplename"]}; '
        f'mv {jobConfig["simplename"]}.zip {jobConfig["simplename"]}/download-{salt}.zip'
    )
    create_done_file_cmd = (
        f'if [ -s "{output_dir}/ranking_debug.json" ] ; '
        f'then touch "{output_dir}/alphafold.done"; fi'
    )
    email_notification_cmd = (
        f'if [ ! -z "{jobConfig["email"]}" ]; '
        f'then if [ -s "{output_dir}/ranking_debug.json" ] ; '
        f'then echo -e "To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\n'
        f'Subject:Alphafold computation has finished\n\n'
        f'Your AlphaFold computation \"{jobConfig["simplename"]}\" has finished, please visit {Config.BASE_URL}/result/{jobConfig["simplename"]} to view the result of your computation\n" | ssmtp -t; '
        f'else echo -e '
        f'"To:{jobConfig["email"]}\nFrom:{Config.EMAIL_FROM}\n'
        f'Subject:Alphafold computation has failed\n\n'
        f'Your alphafold computation \"{jobConfig["simplename"]}\" has failed.\n" '
        f'| cat - {output_dir}/stdout | ssmtp -t; exit 1; '
        f' fi; fi'
    )
    command = " && ".join([mkdir_cmd, alphafold_cmd, public_symlink_cmd, compression_cmd, create_done_file_cmd, email_notification_cmd])

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
                                            client.V1VolumeMount(name="storage", mount_path="/storage")
                                            ],
                        )
                    ],
                    volumes=[client.V1Volume(name="vol-1", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL1_ALPHAFOLD)),
                             client.V1Volume(name="vol-2", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_VOL2)),
                             client.V1Volume(name="dshm", empty_dir=client.V1EmptyDirVolumeSource(medium="Memory", size_limit="1Gi")),
                             client.V1Volume(name="storage", persistent_volume_claim=client.V1PersistentVolumeClaimVolumeSource(claim_name=Config.PVC_STORAGE))
                             ],
                )
            )
        )
    )
    
    return job