import streamlit as st
import os
import requests
st.write(f"__file__ is {__file__}")
base_dir = os.path.dirname(os.path.abspath(__file__))
st.write(f"base_dir is {base_dir}")
file_path = os.path.join(base_dir, 'logo.png')
st.write(f"logo exists: {os.path.exists(file_path)}")
