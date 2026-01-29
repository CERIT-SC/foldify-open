from typing import List, Tuple, Union, Optional
from typing_extensions import TypedDict
from pydantic import BaseModel, validator
import re
import json
import logging

# Define TypedDict for each sequence variant
class ProteinDict(TypedDict):
    protein: "Protein"

class RNADict(TypedDict):
    rna: "RNA"

class DNADict(TypedDict):
    dna: "DNA"

class LigandDict(TypedDict):
    ligand: "Ligand"

# Define the actual models
class Protein(BaseModel):
    id: Union[str, List[str]]
    sequence: str

class RNA(BaseModel):
    id: Union[str, List[str]]
    sequence: str

class DNA(BaseModel):
    id: Union[str, List[str]]
    sequence: str

class Ligand(BaseModel):
    id: Union[str, List[str]]
    ccdCodes: Optional[List[str]] = None
    smiles: Optional[str] = None

    # JSON-escape the SMILES string
    @validator("smiles", pre=True)
    def validate_smiles(cls, v):
        if isinstance(v, str):
            logging.info(f"SMILES: {v}")
            v = json.dumps(v)
            v = v.replace('"', '')
            logging.info(f"SMILES after json.dumps: {v}")
        else:
            raise ValueError("Invalid SMILES format")
        return v


# Union of all possible sequence types
SequenceItem = Union[ProteinDict, RNADict, DNADict, LigandDict]

class Job(BaseModel):
    name: str
    modelSeeds: List[int]
    sequences: List[SequenceItem]
    bondedAtomPairs: Optional[List[List[Tuple[str, int, str]]]] = None
    userCCD: Optional[str] = None
    userCCDPath: Optional[str] = None
    dialect: str = "alphafold3"
    version: int = 1
    public: bool
    email: str
    largeInput: bool
    forceComputation: bool
    precomputedMSA: Optional[bool] = None
    precomputedTemplates: Optional[bool] = None
    numberOfTemplates: Optional[int] = None


    @validator("email")
    def validate_email_af3(cls, v):
        if "@" not in v:
            raise ValueError("Invalid email format")
        if not re.match(r"[^@]+@[^@]+\.[^@]+", v):
            raise ValueError("Invalid email format")
        return v

    @validator("modelSeeds")
    def validate_model_seeds(cls, v):
        if not all(seed > 0 for seed in v):
            raise ValueError("Model seeds must be positive integers")
        return v
    
    @validator("dialect")
    def validate_dialect(cls, v):
        if v != "alphafold3":
            raise ValueError("Invalid dialect")
        return v
    