import pandas as pd
from rdkit import Chem
from rdkit.Chem import Descriptors
import os

file_path = '/Users/carlosseitih.shiraishi/Desktop/2026 WORK/Bianca Papper/Data/Smiles.xlsx'

def analyze():
    # 1. Load data
    df = pd.read_excel(file_path)
    df.columns = df.columns.str.strip()
    
    # 2. Basic Cleaning
    # Remove rows where SMILES or Compound is missing
    initial_count = len(df)
    df = df.dropna(subset=['SMILES', 'Compound']).copy()
    cleaned_count = len(df)
    
    # 3. Chemical Validation and Descriptors
    results = []
    for index, row in df.iterrows():
        smiles = str(row['SMILES']).strip()
        name = str(row['Compound']).strip()
        mol = Chem.MolFromSmiles(smiles)
        
        if mol:
            res = {
                'ID': row['nº'],
                'Compound': name,
                'SMILES': smiles,
                'Rt': row['Rt (min)'],
                'MW': Descriptors.MolWt(mol),
                'LogP': Descriptors.MolLogP(mol),
                'HBD': Descriptors.NumHDonors(mol),
                'HBA': Descriptors.NumHAcceptors(mol),
                'TPSA': Descriptors.TPSA(mol),
                'Valid': True
            }
        else:
            res = {
                'ID': row['nº'],
                'Compound': name,
                'SMILES': smiles,
                'Rt': row['Rt (min)'],
                'Valid': False
            }
        results.append(res)
    
    res_df = pd.DataFrame(results)
    
    # 4. Reporting
    print(f"--- Dataset Summary ---")
    print(f"Initial rows: {initial_count}")
    print(f"Rows after removing NaNs: {cleaned_count}")
    
    invalid_smiles = res_df[~res_df['Valid']]
    if not invalid_smiles.empty:
        print(f"\nInvalid SMILES detected: {len(invalid_smiles)}")
        print(invalid_smiles[['Compound', 'SMILES']])
    else:
        print("\nAll SMILES strings are valid.")
    
    duplicates = res_df[res_df.duplicated(subset=['SMILES'], keep=False)]
    if not duplicates.empty:
        print(f"\nDuplicate SMILES entries: {len(duplicates)}")
        print(duplicates[['Compound', 'SMILES']].sort_values(by='SMILES'))
    
    stats = res_df[res_df['Valid']].describe()
    print("\n--- Physicochemical Property Statistics ---")
    print(stats[['MW', 'LogP', 'TPSA', 'HBD', 'HBA']])

    # Output the analyzed data to a CSV for user review
    output_path = '/Users/carlosseitih.shiraishi/Desktop/2026 WORK/Bianca Papper/Data/Analyzed_Smiles.csv'
    res_df.to_csv(output_path, index=False)
    print(f"\nAnalyzed data saved to: {output_path}")

if __name__ == '__main__':
    analyze()
