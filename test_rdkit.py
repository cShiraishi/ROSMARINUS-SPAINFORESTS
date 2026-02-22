import pandas as pd
from rdkit import Chem
from rdkit.Chem import Draw
import os

df = pd.read_excel('Smiles.xlsx')
df = df.dropna(how='all')
df = df.fillna('N/A')
df = df[df['Compound'] != 'N/A'].reset_index(drop=True)

for i, row in df.head(3).iterrows():
    if pd.notna(row['SMILES']) and row['SMILES'] != 'N/A':
        try:
            mol = Chem.MolFromSmiles(row['SMILES'])
            if mol:
                img = Draw.MolToImage(mol, size=(300, 300))
                print(f"Success {i}")
            else:
                print(f"None mol {i}")
        except Exception as e:
            print(f"Error {i}", e)
