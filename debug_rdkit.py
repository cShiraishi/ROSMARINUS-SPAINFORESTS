import streamlit as st
import sys
st.write(f"Python: {sys.executable}")
try:
    from rdkit import Chem
    from rdkit.Chem import Draw
    st.success("RDKit loaded OK!")
    mol = Chem.MolFromSmiles("CC1(C2CC3C1(C3C2)C)C")
    img = Draw.MolToImage(mol)
    st.image(img)
except Exception as e:
    st.error(f"FAILED: {e}")
