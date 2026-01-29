from Bio.PDB import PDBParser, MMCIFParser, PDBIO, Superimposer
from Bio.Align import PairwiseAligner
from io import StringIO
import logging
def parse_structure_from_string(structure_data, data_format, structure_id="structure"):
    """
    Parse a structure from a string.
    
    Args:
        structure_data: String containing structure data
        data_format: 'pdb' or 'mmcif'
        structure_id: Identifier for the structure
    
    Returns:
        Biopython Structure object
    """
    try:
        if data_format == "mmcif":
            parser = MMCIFParser(QUIET=True)
            # MMCIFParser expects a file-like object
            structure = parser.get_structure(structure_id, StringIO(structure_data))
        elif data_format == "pdb":
            parser = PDBParser(QUIET=True)
            structure = parser.get_structure(structure_id, StringIO(structure_data))
        else:
            raise ValueError(f"Unsupported format: {data_format}")
        
        return structure
    except Exception as e:
        logging.error(f"Error parsing structure: {e}")
        raise


def get_ca_atoms(structure):
    """
    Extract C-alpha atoms from a structure for alignment.
    
    Args:
        structure: Biopython Structure object
    
    Returns:
        List of C-alpha atoms
    """
    ca_atoms = []
    for model in structure:
        for chain in model:
            for residue in chain:
                if residue.has_id('CA'):
                    ca_atoms.append(residue['CA'])
    return ca_atoms


def get_sequence_from_structure(structure):
    """
    Extract amino acid sequence from a structure.
    
    Args:
        structure: Biopython Structure object
    
    Returns:
        String representing the amino acid sequence
    """
    # Mapping of three-letter codes to one-letter codes
    aa_map = {
        'ALA': 'A', 'CYS': 'C', 'ASP': 'D', 'GLU': 'E', 'PHE': 'F',
        'GLY': 'G', 'HIS': 'H', 'ILE': 'I', 'LYS': 'K', 'LEU': 'L',
        'MET': 'M', 'ASN': 'N', 'PRO': 'P', 'GLN': 'Q', 'ARG': 'R',
        'SER': 'S', 'THR': 'T', 'VAL': 'V', 'TRP': 'W', 'TYR': 'Y'
    }
    
    sequence = []
    for model in structure:
        for chain in model:
            for residue in chain:
                if residue.has_id('CA'):
                    res_name = residue.get_resname()
                    # Convert to one-letter code, use 'X' for unknown
                    sequence.append(aa_map.get(res_name, 'X'))
    
    return ''.join(sequence)


def align_sequences(seq1, seq2):
    """
    Perform pairwise sequence alignment to find matching residues.
    
    Args:
        seq1: First sequence (string)
        seq2: Second sequence (string)
    
    Returns:
        Tuple of (aligned_seq1, aligned_seq2, alignment_score)
        where aligned sequences have gaps ('-') inserted
    """
    try:
        # Create PairwiseAligner instance
        aligner = PairwiseAligner()
        
        # Configure for global alignment with match/mismatch scoring
        # Default parameters similar to pairwise2.align.globalxx
        aligner.match_score = 1
        aligner.mismatch_score = 0
        aligner.open_gap_score = 0
        aligner.extend_gap_score = 0
        aligner.mode = 'global'
        
        # Perform alignment
        alignments = aligner.align(seq1, seq2)
        
        if len(alignments) == 0:
            logging.warning("No sequence alignment found")
            return seq1, seq2, 0
        
        # Get the best alignment (first one, highest score)
        best_alignment = alignments[0]
        aligned_seq1 = str(best_alignment[0])
        aligned_seq2 = str(best_alignment[1])
        score = best_alignment.score
        
        if len(aligned_seq1) > 0:
            identity = score / len(aligned_seq1) * 100
            logging.info(f"Sequence alignment score: {score}, identity: {identity:.1f}%")
        else:
            logging.warning("Aligned sequence is empty; cannot calculate identity percentage.")
        
        return aligned_seq1, aligned_seq2, score
        
    except Exception as e:
        logging.error(f"Error during sequence alignment: {e}")
        return seq1, seq2, 0


def get_matched_ca_atoms(ref_ca_atoms, mobile_ca_atoms, aligned_seq1, aligned_seq2):
    """
    Extract matching CA atom pairs based on sequence alignment.
    
    Args:
        ref_ca_atoms: List of reference CA atoms
        mobile_ca_atoms: List of mobile CA atoms
        aligned_seq1: Aligned reference sequence (with gaps)
        aligned_seq2: Aligned mobile sequence (with gaps)
    
    Returns:
        Tuple of (matched_ref_atoms, matched_mobile_atoms)
    """
    matched_ref = []
    matched_mobile = []
    
    ref_idx = 0
    mobile_idx = 0
    
    for i in range(len(aligned_seq1)):
        ref_has_residue = aligned_seq1[i] != '-'
        mobile_has_residue = aligned_seq2[i] != '-'
        
        # Both sequences have a residue at this position - they match
        if ref_has_residue and mobile_has_residue:
            if ref_idx < len(ref_ca_atoms) and mobile_idx < len(mobile_ca_atoms):
                matched_ref.append(ref_ca_atoms[ref_idx])
                matched_mobile.append(mobile_ca_atoms[mobile_idx])
        
        # Advance indices
        if ref_has_residue:
            ref_idx += 1
        if mobile_has_residue:
            mobile_idx += 1
    
    logging.info(f"Found {len(matched_ref)} matching residue pairs out of {len(ref_ca_atoms)} and {len(mobile_ca_atoms)} residues")
    
    return matched_ref, matched_mobile



def calculate_tm_score(ref_ca_atoms, mobile_ca_atoms):
    """
    Calculate TM-score between two sets of aligned CA atoms.
    TM-score is a length-independent metric ranging from 0 to 1,
    where values > 0.5 indicate similar folds.
    
    Args:
        ref_ca_atoms: List of reference C-alpha atoms
        mobile_ca_atoms: List of mobile C-alpha atoms (already aligned)
    
    Returns:
        TM-score (float)
    """
    try:
        min_length = min(len(ref_ca_atoms), len(mobile_ca_atoms))
        if min_length == 0:
            return 0.0
        
        # Use the length of the reference structure for normalization
        L_target = len(ref_ca_atoms)
        
        # Calculate d0 (distance scale)
        # For proteins with L > 21: d0 = 1.24 * (L-15)^(1/3) - 1.8
        if L_target > 21:
            d0 = 1.24 * pow(L_target - 15, 1.0/3.0) - 1.8
        else:
            d0 = 0.5
        
        # Calculate TM-score
        tm_score_sum = 0.0
        for i in range(min_length):
            # Calculate distance between corresponding atoms
            distance = ref_ca_atoms[i] - mobile_ca_atoms[i]
            # TM-score formula: 1 / (1 + (di/d0)^2)
            tm_score_sum += 1.0 / (1.0 + (distance / d0) ** 2)
        
        # Normalize by target length
        tm_score = tm_score_sum / L_target
        
        logging.info(f"TM-score: {tm_score:.4f}")
        return tm_score
        
    except Exception as e:
        logging.error(f"Error calculating TM-score: {e}")
        return 0.0


def align_structure(reference_structure, mobile_structure):
    """
    Align mobile_structure to reference_structure using C-alpha atoms.
    Uses sequence alignment to find matching residues before structural alignment.
    Modifies mobile_structure in place.
    
    Args:
        reference_structure: Biopython Structure object (reference)
        mobile_structure: Biopython Structure object (to be aligned)
    
    Returns:
        Tuple of (RMSD value (float), TM-score (float))
    """
    try:
        ref_ca_atoms = get_ca_atoms(reference_structure)
        mobile_ca_atoms = get_ca_atoms(mobile_structure)
        
        # Ensure both structures have atoms
        if not ref_ca_atoms or not mobile_ca_atoms:
            raise ValueError("No C-alpha atoms found for alignment")
        
        # Get sequences from structures
        ref_sequence = get_sequence_from_structure(reference_structure)
        mobile_sequence = get_sequence_from_structure(mobile_structure)
        
        logging.info(f"Reference sequence length: {len(ref_sequence)}, Mobile sequence length: {len(mobile_sequence)}")
        
        # Perform sequence alignment to find matching residues
        aligned_ref_seq, aligned_mobile_seq, alignment_score = align_sequences(ref_sequence, mobile_sequence)
        
        # Get matched CA atom pairs based on sequence alignment
        ref_atoms, mobile_atoms = get_matched_ca_atoms(
            ref_ca_atoms, mobile_ca_atoms, 
            aligned_ref_seq, aligned_mobile_seq
        )
        
        # Check if we have enough matched atoms for alignment
        if len(ref_atoms) < 3:
            raise ValueError(f"Not enough matching residues found ({len(ref_atoms)}). Need at least 3 for alignment.")
        
        # Perform superimposition using only matched atoms
        superimposer = Superimposer()
        superimposer.set_atoms(ref_atoms, mobile_atoms)
        
        # Apply rotation and translation to all atoms in mobile structure
        for model in mobile_structure:
            for chain in model:
                for residue in chain:
                    for atom in residue:
                        atom.transform(superimposer.rotran[0], superimposer.rotran[1])
        
        rmsd = superimposer.rms
        
        # Calculate TM-score after alignment using matched atoms
        tm_score = calculate_tm_score(ref_atoms, mobile_atoms)
        
        logging.info(f"Alignment RMSD: {rmsd:.2f} Å, TM-score: {tm_score:.4f} (based on {len(ref_atoms)} matched residues)")
        return rmsd, tm_score
        
    except Exception as e:
        logging.error(f"Error during structure alignment: {e}")
        raise


def structure_to_string(structure, output_format='pdb', custom_name=None):
    """
    Convert a Biopython structure to a string in PDB format.
    
    Args:
        structure: Biopython Structure object
        output_format: 'pdb' or 'mmcif' (always outputs PDB for consistency)
        custom_name: Optional custom name to add to the structure
    
    Returns:
        String representation of the structure in PDB format
    """
    try:
        io = PDBIO()
        io.set_structure(structure)
        
        output = StringIO()
        io.save(output)
        result = output.getvalue()
        output.close()
        
        # If a custom name is provided, add it to the PDB header
        if custom_name:
            lines = result.split('\n')
            # Add a TITLE record at the beginning (after any existing HEADER)
            title_line = f"TITLE     {custom_name}"
            
            # Find where to insert the TITLE (after HEADER if it exists, otherwise at the beginning)
            insert_index = 0
            for i, line in enumerate(lines):
                if line.startswith('HEADER'):
                    insert_index = i + 1
                    break
                if line.startswith('TITLE') or line.startswith('ATOM') or line.startswith('MODEL'):
                    insert_index = i
                    break
            
            lines.insert(insert_index, title_line)
            result = '\n'.join(lines)
        
        return result
    except Exception as e:
        logging.error(f"Error converting structure to string: {e}")
        raise


def align_multiple_structures(models_data):
    """
    Align multiple structures to the first one (reference).
    
    Args:
        models_data: Dictionary with structure names as keys and values containing:
                    {'model': str, 'dataFormat': str}
    
    Returns:
        Dictionary with aligned structures:
        {name: {'model': str, 'dataFormat': str, 'rmsd': float, 'tm_score': float}}
    """
    if len(models_data) < 2:
        logging.warning("Need at least 2 structures for alignment")
        return models_data
    
    aligned_structures = {}
    
    # Get the first structure as reference
    job_names = list(models_data.keys())
    ref_name = job_names[0]
    ref_data = models_data[ref_name]
    
    try:
        # Parse reference structure
        reference = parse_structure_from_string(
            ref_data['model'], 
            ref_data['dataFormat'], 
            "reference"
        )
        
        # Add reference structure (no alignment needed, RMSD = 0, TM-score = 1.0)
        # Always output as PDB format for consistency with aligned structures
        ref_model_string = structure_to_string(reference, 'pdb', custom_name=ref_name)
        aligned_structures[ref_name] = {
            'model': ref_model_string,
            'dataFormat': 'pdb',  # Unified format
            'rmsd': 0.0,
            'tm_score': 1.0
        }
        
        logging.info(f"Using {ref_name} as reference structure")
        
        # Align remaining structures
        for i, mobile_name in enumerate(job_names[1:], 1):
            mobile_data = models_data[mobile_name]
            
            try:
                # Parse mobile structure
                mobile = parse_structure_from_string(
                    mobile_data['model'],
                    mobile_data['dataFormat'],
                    f"mobile_{i}"
                )
                
                # Align to reference - returns (rmsd, tm_score)
                rmsd, tm_score = align_structure(reference, mobile)
                
                # Convert aligned structure back to string with custom name
                # Always output as PDB for consistency (Mol* handles both well)
                aligned_model_string = structure_to_string(mobile, 'pdb', custom_name=mobile_name)
                
                aligned_structures[mobile_name] = {
                    'model': aligned_model_string,
                    'dataFormat': 'pdb',  # Unified format after alignment
                    'rmsd': round(rmsd, 2),
                    'tm_score': round(tm_score, 4)
                }
                
                logging.info(f"Aligned {mobile_name} with RMSD: {rmsd:.2f} Å, TM-score: {tm_score:.4f}")
                
            except Exception as e:
                logging.error(f"Failed to align {mobile_name}: {e}")
                # Include original unaligned structure with error indicator
                aligned_structures[mobile_name] = {
                    'model': mobile_data['model'],
                    'dataFormat': mobile_data['dataFormat'],
                    'rmsd': -1.0,  # -1 indicates alignment failure
                    'tm_score': 0.0,
                    'error': str(e)
                }
        
        return aligned_structures
        
    except Exception as e:
        logging.error(f"Error in alignment process: {e}")
        # Return original data if alignment fails completely
        return models_data