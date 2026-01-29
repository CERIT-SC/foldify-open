from app.shared.job_submitting import generate_random_suffix, create_simple_name
from config import Config

# Default max template dates for AlphaFold versions
DEFAULT_DATES = {
    "Alphafold 2.2.0": "2020-05-14",
    "Alphafold 2.3.1": "2022-01-01"
}

def set_default_date(version):
    """Set the default max template date based on the AlphaFold version."""
    return DEFAULT_DATES.get(version)
    
def create_alphafold2_job_config(data, user):
    """Create the job configuration dictionary."""
    simplename = create_simple_name(data["jobName"])
    uniquename = f"{simplename}-{generate_random_suffix()}"

    if data["maxTemplateDate"] is None:
        data["maxTemplateDate"] = set_default_date(data["version"])
    if data["maxTemplateDate"] and len(data["maxTemplateDate"]) > 10:
        data["maxTemplateDate"] = data["maxTemplateDate"][:10]

    jobConfig = {
        "uniquename": uniquename,
        "simplename": data["jobName"],
        "user": user,
        "input": f"/mnt/input/{user}/{data['jobName']}.fasta",
        "proteinSequence": data["proteinSequence"],
        "maxTemplateDate": data["maxTemplateDate"],
        "dbPreset": data["dbPreset"],
        "modelPreset": data["modelPreset"],
        "reuseMSAs": data["reuseMSAs"],
        "predictionsPerModel": data["predictionsPerModel"],
        "runRelax": data["runRelax"],
        "makeResultsPublic": str(data["makeResultsPublic"]).lower(),
        "email": data["email"],
        "service": "AlphaFold",
        "forceComputation": data["forceComputation"]
    }
    
    if (data["version"] == "Alphafold 2.2.0"):
        jobConfig["container"] = Config.ALPHAFOLD_IMAGE_V0
        jobConfig["nodeselector"] = "\n      nodeSelector:\n        nvidia.com/gpu.compute.major: \"8\""
        jobConfig["uniref90"] = "/data/uniref90/uniref90.fasta"
        jobConfig["mgnify"] = "/data/mgnify/mgy_clusters_2018_12.fa"
        jobConfig["mmcif"] = "/data/pdb_mmcif/mmcif_files"
        jobConfig["obsolete"] = "/data/pdb_mmcif/obsolete.dat"
        jobConfig["pdbdb"] = "/data/pdb70/pdb70"
        jobConfig["data"] = "/data"
        jobConfig["pdbseq"] = "/data/pdb_seqres/pdb_seqres.txt"
        jobConfig["uniprot"] = "/data/uniprot/uniprot.fasta"
        if (data["dbPreset"] == "reduced_dbs"):
            jobConfig["reduced"] = "--small_bfd_database_path=/data/small_bfd/bfd-first_non_consensus_sequences.fasta"
            jobConfig["full"] = ""
            jobConfig["uniclust"] = ""
        else:
            jobConfig["reduced"] = ""
            jobConfig["full"] = "--uniclust30_database_path=/data/uniclust30/uniclust30_2018_08/uniclust30_2018_08"
            jobConfig["uniclust"] = "--bfd_database_path=/data/bfd/bfd_metaclust_clu_complete_id30_c90_final_seq.sorted_opt"
    else:
        # using Alphafold 2.3.1. by default
        jobConfig["container"] = Config.ALPHAFOLD_IMAGE_V2
        jobConfig["nodeselector"] = ""
        jobConfig["uniref90"] = "/data/v3/uniref90/uniref90.fasta"
        jobConfig["mgnify"] = "/data/v3/mgnify/mgy_clusters_2022_05.fa"
        jobConfig["mmcif"] = "/data/v3/pdb_mmcif/mmcif_files"
        jobConfig["obsolete"] = "/data/v3/pdb_mmcif/obsolete.dat"
        jobConfig["pdbdb"] = "/data/v3/pdb70/pdb70"
        jobConfig["data"] = "/data/v3"
        jobConfig["pdbseq"] = "/data/v3/pdb_seqres/pdb_seqres.txt"
        jobConfig["uniprot"] = "/data/v3/uniprot/uniprot_trembl.fasta"
        if (data["dbPreset"] == "reduced_dbs"):
            jobConfig["reduced"] = "--small_bfd_database_path=/data/v3/small_bfd/bfd-first_non_consensus_sequences.fasta"
            jobConfig["full"] = ""
            jobConfig["uniclust"] = ""
        else:
            jobConfig["reduced"] = ""
            jobConfig["full"] = "--uniref30_database_path=/data/v3/uniref30/UniRef30_2021_03"
            jobConfig["uniclust"] = "--bfd_database_path=/data/v3/bfd/bfd_metaclust_clu_complete_id30_c90_final_seq.sorted_opt"
        
    return jobConfig

def create_alphafold2_file_config(jobConfig):
    """Create the file configuration dictionary."""
    fileConfig = {
        "user": jobConfig["user"],
        "name": jobConfig["simplename"],
        "maxtemplate": jobConfig["maxTemplateDate"],
        "dbpreset": jobConfig["dbPreset"],
        "modelpreset": jobConfig["modelPreset"],
        "msas": jobConfig["reuseMSAs"],
        "predictions": jobConfig["predictionsPerModel"],
        "runrelax": jobConfig["runRelax"],
        "public": jobConfig["makeResultsPublic"],
        "service": jobConfig["service"]
    }
    
    return fileConfig