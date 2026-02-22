import pandas as pd
import os
import re
from rdkit import Chem
from rdkit.Chem import Draw

def generate():
    # Load data
    file_path = 'Smiles.xlsx'
    df = pd.read_excel(file_path)
    df = df.dropna(subset=['Compound', 'SMILES'])
    
    os.makedirs('mol_images', exist_ok=True)
    
    success_count = 0
    for _, row in df.iterrows():
        name = str(row['Compound']).strip().replace('/', '_').replace(' ', '_')
        smiles = str(row['SMILES']).strip()
        
        if smiles == 'N/A' or not smiles:
            continue
            
        try:
            mol = Chem.MolFromSmiles(smiles)
            if mol:
                # Generate SVG text
                svg = Draw.MolsToGridImage([mol], molsPerRow=1, subImgSize=(300, 300), useSVG=True)
                
                # Save as .svg file
                filename = f"mol_images/{name}.svg"
                with open(filename, 'w') as f:
                    f.write(svg)
                success_count += 1
                print(f"Generated: {filename}")
        except Exception as e:
            print(f"Failed {name}: {e}")
            
    print(f"\nSuccessfully generated {success_count} molecules.")

if __name__ == "__main__":
    generate()
