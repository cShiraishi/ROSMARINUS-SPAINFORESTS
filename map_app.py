import streamlit as st
import pandas as pd
import re
import os
import plotly.express as px
import plotly.graph_objects as go
from PIL import Image

# --- CONFIGURATION ---
st.set_page_config(
    page_title="ROSMARINUS-SPAINFORESTS | Phytochemical Repository",
    page_icon="🌿",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- CSS INJECTION ---
def local_css(file_name):
    with open(file_name) as f:
        st.markdown(f'<style>{f.read()}</style>', unsafe_allow_html=True)

if os.path.exists("style.css"):
    local_css("style.css")
else:
    # Fallback basic styling if file is missing
    st.markdown("""
        <style>
        .main-title { font-size: 32px; color: #2D5A27; font-weight: bold; }
        .mol-card { border: 1px solid #ddd; padding: 10px; border-radius: 10px; margin-bottom: 10px; }
        </style>
    """, unsafe_allow_html=True)

# --- UTILITIES ---
def get_mol_image_path(compound_name):
    """Checks if a pre-generated SVG exists for the compound."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    safe_name = str(compound_name).strip().replace('/', '_').replace(' ', '_')
    img_path = os.path.join(base_dir, 'mol_images', f"{safe_name}.svg")
    return img_path if os.path.exists(img_path) else None

def dms_to_decimal(dms_str, direction):
    """Converts Degrees Minutes Seconds to Decimal Degrees."""
    try:
        match = re.search(r"(\d+)°(\d+)′?([\d.]+)?″?", dms_str)
        if not match: return None
        degrees = float(match.group(1))
        minutes = float(match.group(2))
        seconds = float(match.group(3)) if match.group(3) else 0.0
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        if direction in ['S', 'W', 'O']: decimal *= -1
        return decimal
    except Exception: return None

@st.cache_data
def load_and_process_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'localization_data.xlsx')
    if not os.path.exists(file_path): return None
    
    df = pd.read_excel(file_path)
    df_t = df.set_index(df.columns[0]).transpose()
    df_t.columns = df_t.columns.str.strip()
    
    processed_data = []
    for idx, row in df_t.iterrows():
        loc_ref = row.get('Location', idx)
        munic_raw = str(row.get('Munic/province', 'Unknown'))
        city, prov = (munic_raw.split('/') + ['Unknown'])[:2] if '/' in munic_raw else (munic_raw, munic_raw)
        
        # Mapping known abbreviations
        mapping = {
            'Vald.': 'Valdemanco', 'Carbo': 'Carboneras', 'Albuñu.': 'Albuñuelas',
            'GU': 'Guadalajara', 'NA': 'Navarra', 'M': 'Madrid', 
            'AB': 'Albacete', 'GR': 'Granada', 'AL': 'Almería'
        }
        for k, v in mapping.items():
            city = city.replace(k, v)
            prov = prov.replace(k, v)
            
        lat = dms_to_decimal(str(row.get('Longitude (N)')), 'N')
        lon = dms_to_decimal(str(row.get('Latitude (W)')), 'W')
        
        if lat is not None and lon is not None:
            display_city = city
            if loc_ref == 'L5': display_city = f"{city} (A)"
            if loc_ref == 'L6': display_city = f"{city} (B)"
            
            processed_data.append({
                'Name': idx, 'Ref': loc_ref, 'Region': f"{loc_ref} - {display_city}",
                'City': city.strip(), 'Province': prov.strip(), 'lat': lat, 'lon': lon,
                'Altitude': row.get('Altitude (m)', 'N/A'),
                'Rainfall (mm)': row.get('Rainfall (mm)', 'N/A'),
                'Mean Ann T (°C)': row.get('Mean Ann T (°C)', 'N/A'),
                'Soil reaction': row.get('Soil reaction', 'N/A'),
                'Sampling Date': row.get('Sampling Date', 'N/A')
            })
    return pd.DataFrame(processed_data)

@st.cache_data
def load_smiles_data():
    file_path = 'Smiles.xlsx'
    if not os.path.exists(file_path): return None
    df = pd.read_excel(file_path).dropna(how='all')
    if 'nº ' in df.columns:
        df['nº '] = df['nº '].apply(lambda x: str(int(x)) if pd.notna(x) else 'N/A')
    df = df.fillna('N/A')
    return df[df['Compound'] != 'N/A'].reset_index(drop=True)

@st.cache_data
def load_chemical_distribution():
    file_path = 'Smiles.xlsx'
    if not os.path.exists(file_path): return None
    try:
        df = pd.read_excel(file_path, sheet_name='Sheet3').dropna(subset=['Compound'])
        def extract_val(v):
            if pd.isna(v) or v in ['N/A', '-']: return 0.0
            try:
                s = re.sub(r'[^0-9.]', '', str(v).split('±')[0].strip())
                return float(s) if s else 0.0
            except: return 0.0
        loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
        for col in loc_cols: df[col] = df[col].apply(extract_val)
        return df
    except Exception: return None

# --- DATA INITIALIZATION ---
data = load_and_process_data()
smiles_data = load_smiles_data()
dist_data = load_chemical_distribution()

if data is None or data.empty:
    st.error("⚠️ Primary data assets missing. Please verify the repository structure.")
    st.stop()

# --- SIDEBAR ---
with st.sidebar:
    base_dir = os.path.dirname(os.path.abspath(__file__))
    for ext in ['png', 'jpg']:
        path = os.path.join(base_dir, f'logo.{ext}')
        if os.path.exists(path):
            st.image(path, use_container_width=True)
            break
            
    st.markdown('<div class="sidebar-header">🌿 ROSMARINUS CORE</div>', unsafe_allow_html=True)
    st.info("Tracking the phytochemical footprint of *Salvia rosmarinus* across Spanish endemic forests.")
    
    st.divider()
    st.markdown("### 📊 Dataset Stats")
    c1, c2 = st.columns(2)
    c1.metric("Samples", len(data))
    c2.metric("Sites", data['Region'].nunique())
    st.metric("Compounds Isolated", len(smiles_data) if smiles_data is not None else 0)
    
    st.divider()
    st.markdown("### 📖 Research Context")
    st.caption("""
    This platform integrates climatic descriptors with chemical chromatography to map environmental influence on rosemary oil composition.
    """)
    st.markdown("---")
    st.markdown("© 2024 Rosmarinus Project")

# --- MAIN INTERFACE ---
st.markdown('<h1 class="main-title">🌿 ROSMARINUS-SPAINFORESTS</h1>', unsafe_allow_html=True)
st.markdown("""
<div style="font-size: 1.2rem; color: #4A7C44; margin-bottom: 2rem;">
    Phytochemical Essential Oil Repository & Geographical Distribution Analytics
</div>
""", unsafe_allow_html=True)

# Top KPI Row with enhanced styling
kpi1, kpi2, kpi3, kpi4 = st.columns(4)
with kpi1:
    st.markdown('<div class="metric-card"><strong>Relief & Altitude</strong><br><span style="font-size: 1.5rem; color: #2D5A27;">260 - 1120 m</span></div>', unsafe_allow_html=True)
with kpi2:
    st.markdown('<div class="metric-card"><strong>Mean Temperature</strong><br><span style="font-size: 1.5rem; color: #2D5A27;">10.9 - 18.0 °C</span></div>', unsafe_allow_html=True)
with kpi3:
    st.markdown('<div class="metric-card"><strong>Rainfall Regime</strong><br><span style="font-size: 1.5rem; color: #2D5A27;">267 - 688 mm</span></div>', unsafe_allow_html=True)
with kpi4:
    st.markdown('<div class="metric-card"><strong>Bio-Diversity</strong><br><span style="font-size: 1.5rem; color: #2D5A27;">+50 Volatiles</span></div>', unsafe_allow_html=True)

st.write("")

# --- TABS ---
tabs = st.tabs([
    "📍 Geographic Distribution", 
    "📊 Comparative Analytics", 
    "🧪 Molecular Library", 
    "🗃️ Raw Repository"
])

# TAB 1: MAPPING
with tabs[0]:
    st.markdown("### 🌍 Spatial Mapping of Sampling Sites")
    st.markdown("Interactive distribution of *Salvia rosmarinus* populations across the Iberian Peninsula.")
    
    fig = px.scatter_mapbox(
        data, lat="lat", lon="lon", hover_name="Region",
        hover_data={"lat": False, "lon": False, "Province": True, "Altitude": True, "Rainfall (mm)": True, "Mean Ann T (°C)": True},
        color="Province", size_max=15, zoom=5.5,
        center={"lat": data['lat'].mean(), "lon": data['lon'].mean()},
        color_discrete_sequence=px.colors.qualitative.Dark2,
        height=600
    )
    fig.update_layout(
        mapbox_style="carto-positron", # Cleaner look
        margin={"r":0,"t":0,"l":0,"b":0},
        legend_title_text='Spanish Provinces'
    )
    fig.update_traces(marker=dict(size=18, opacity=0.9))
    st.plotly_chart(fig, use_container_width=True)

# TAB 2: ANALYTICS
with tabs[1]:
    st.markdown("### 📈 Multivariate Chemical Insights")
    
    if dist_data is not None:
        col_a, col_b = st.columns([2, 1])
        loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
        
        with col_a:
            diversity = (dist_data[loc_cols] > 0).sum().reset_index()
            diversity.columns = ['Site ID', 'Compound Count']
            
            fig_div = px.bar(
                diversity, x='Site ID', y='Compound Count',
                color='Compound Count', color_continuous_scale='Greens',
                text_auto=True, title="Chemical Richness per Sampling Site"
            )
            fig_div.update_layout(plot_bgcolor='rgba(0,0,0,0)', paper_bgcolor='rgba(0,0,0,0)')
            st.plotly_chart(fig_div, use_container_width=True)
        
        with col_b:
            st.markdown("#### Quantitative Summary")
            st.dataframe(diversity.sort_values('Compound Count', ascending=False), hide_index=True, use_container_width=True)
            
        st.divider()
        st.markdown("#### 🌡️ Presence Heatmap (Dominant Compounds)")
        dist_data['Global_Sum'] = dist_data[loc_cols].sum(axis=1)
        top_compounds = dist_data.nlargest(12, 'Global_Sum')
        heatmap_data = top_compounds.set_index('Compound')[loc_cols]
        
        fig_heat = px.imshow(
            heatmap_data, x=loc_cols, y=heatmap_data.index,
            color_continuous_scale='YlGn', labels=dict(color="Concentration"),
            aspect="auto"
        )
        st.plotly_chart(fig_heat, use_container_width=True)
    else:
        st.info("Distribution data currently being synthesized.")

# TAB 3: MOLECULAR LIBRARY
with tabs[2]:
    st.markdown("### 🧪 Essential Oil Molecular Library")
    st.markdown("Catalog of isolated volatiles with SMILES strings and structural visualization.")
    
    if smiles_data is not None and not smiles_data.empty:
        # Search filter
        search_query = st.text_input("🔍 Search compounds by name or SMILES", "").lower()
        filtered_df = smiles_data[
            smiles_data['Compound'].str.lower().str.contains(search_query) | 
            smiles_data['SMILES'].str.lower().str.contains(search_query)
        ]
        
        m_cols = st.columns(4)
        for idx, row in filtered_df.iterrows():
            with m_cols[idx % 4]:
                st.markdown(f"""
                <div class="mol-card">
                    <div class="mol-title">{row['Compound']}</div>
                    <div class="mol-rt">Retention Time: <b>{row['Rt (min)']} min</b></div>
                </div>
                """, unsafe_allow_html=True)
                
                img_path = get_mol_image_path(row['Compound'])
                if img_path:
                    with open(img_path, 'r') as f:
                        st.image(f.read(), use_container_width=True)
                else:
                    st.caption("📷 *Structure Rendering unavailable*")
                
                st.code(row['SMILES'], language="text")
                
                if dist_data is not None:
                    match = dist_data[dist_data['Compound'] == row['Compound']]
                    if not match.empty:
                        found_in = [l for l in loc_cols if match.iloc[0][l] > 0]
                        if found_in:
                            st.markdown(f"<span style='font-size:0.8rem;'>📍 Found: {', '.join(found_in)}</span>", unsafe_allow_html=True)
                st.markdown("<br>", unsafe_allow_html=True)
    else:
        st.warning("Molecule library is empty.")

# TAB 4: RAW DATA
with tabs[3]:
    st.markdown("### 🗃️ Raw Data Repository")
    st.write("Access the underlying data matrices for transparency and further research.")
    
    exp1 = st.expander("📍 Geographic Metadata (localization_data.xlsx)", expanded=True)
    exp1.dataframe(data, use_container_width=True, hide_index=True)
    
    if smiles_data is not None:
        exp2 = st.expander("🧪 Chemical Library Source (Smiles.xlsx)", expanded=False)
        exp2.dataframe(smiles_data, use_container_width=True, hide_index=True)

st.write("---")
st.markdown("""
<div style="text-align: center; color: #888; font-size: 0.9rem;">
    This dashboard was developed to support multivariate analysis in ethnobotanical studies. <br>
    For technical inquiries, please refer to the project documentation.
</div>
""", unsafe_allow_html=True)
