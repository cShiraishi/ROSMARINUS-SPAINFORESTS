import streamlit as st
import pandas as pd
import re
import os
import plotly.express as px
import requests

def get_mol_image_path(compound_name):
    """Checks if a pre-generated SVG exists for the compound."""
    base_dir = os.path.dirname(os.path.abspath(__file__))
    safe_name = str(compound_name).strip().replace('/', '_').replace(' ', '_')
    img_path = os.path.join(base_dir, 'mol_images', f"{safe_name}.svg")
    return img_path if os.path.exists(img_path) else None
    
from PIL import Image

# Configures the page
st.set_page_config(
    page_title="Salvia rosmarinus - Spanish Forest Locations",
    page_icon="🌿",
    layout="wide"
)

st.title("🌿 ROSMARINUS-SPAINFORESTS: A Phytochemical Essential Oil Repository of Salvia rosmarinus")
st.subheader("Geographical Distribution of Samples from Spanish Forests")

st.markdown("""
This interactive tracking repository documents the geographical and environmental provenance of **Salvia rosmarinus** (Rosemary) essential oil samples collected across endemic populations in the Iberian Peninsula.
""")

def dms_to_decimal(dms_str, direction):
    """Converts Degrees Minutes Seconds to Decimal Degrees."""
    try:
        # Regex to find degrees, minutes, seconds
        match = re.search(r"(\d+)°(\d+)′?([\d.]+)?″?", dms_str)
        if not match:
            return None
        
        degrees = float(match.group(1))
        minutes = float(match.group(2))
        seconds = float(match.group(3)) if match.group(3) else 0.0
        
        decimal = degrees + (minutes / 60.0) + (seconds / 3600.0)
        
        if direction in ['S', 'W', 'O']:
            decimal *= -1
            
        return decimal
    except Exception as e:
        return None

def load_and_process_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'localization_data.xlsx')
    if not os.path.exists(file_path):
        st.error(f"File not found: {file_path}")
        return None
    
    # Read the Excel file
    df = pd.read_excel(file_path)
    
    # Transpose the data
    df_t = df.set_index(df.columns[0]).transpose()
    df_t.columns = df_t.columns.str.strip()
    
    # Rename columns for easier access
    # Note: Longitude (N) appears to be Latitude, and Latitude (W) appears to be Longitude
    # We will check the labels and convert
    processed_data = []
    
    for idx, row in df_t.iterrows():
        name = idx
        loc_ref = row.get('Location', idx)
        munic_raw = str(row.get('Munic/province', 'Unknown'))
        city = munic_raw
        prov = munic_raw
        
        if '/' in munic_raw:
            parts = munic_raw.split('/')
            city = parts[0].strip()
            prov = parts[1].strip()
            
        city = city.replace('Vald.', 'Valdemanco')
        city = city.replace('Carbo', 'Carboneras')
        city = city.replace('Albuñu.', 'Albuñuelas')
        
        prov = prov.replace('GU', 'Guadalajara')
        prov = prov.replace('NA', 'Navarra')
        prov = prov.replace('M', 'Madrid')
        prov = prov.replace('AB', 'Albacete')
        prov = prov.replace('GR', 'Granada')
        prov = prov.replace('AL', 'Almería')
            
        # Determine lat/lon from the unusual labels
        lat_raw = row.get('Longitude (N)')
        lon_raw = row.get('Latitude (W)')
        
        lat = dms_to_decimal(str(lat_raw), 'N')
        lon = dms_to_decimal(str(lon_raw), 'W')
        
        if lat is not None and lon is not None:
            # L5 and L6 are the same City but different coordinates.
            # We create a unique "Region/Sampling Point" label combining Location and City.
            unique_region_id = f"{loc_ref} - {city}"
            processed_data.append({
                'Name': name,
                'Ref': loc_ref,
                'Region': unique_region_id,
                'City': city,
                'Province': prov,
                'lat': lat,
                'lon': lon,
                'Altitude': row.get('Altitude (m)', 'N/A'),
                'Rainfall (mm)': row.get('Rainfall (mm)', 'N/A'),
                'Mean Ann T (°C)': row.get('Mean Ann T (°C)', 'N/A'),
                'Soil reaction': row.get('Soil reaction', 'N/A'),
                'Sampling Date': row.get('Sampling Date', 'N/A')
            })
            
    return pd.DataFrame(processed_data)

def load_smiles_data():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'Smiles.xlsx')
    if not os.path.exists(file_path):
        return None
    
    # Read the Excel file
    df = pd.read_excel(file_path)
    
    # Drop rows that are entirely empty
    df = df.dropna(how='all')
    
    # Safely convert nº to int if it's not nan
    if 'nº ' in df.columns:
        df['nº '] = df['nº '].apply(lambda x: str(int(x)) if pd.notna(x) else 'N/A')
        
    df = df.fillna('N/A')

    # Drop rows that don't have a valid Compound name
    df = df[df['Compound'] != 'N/A'].reset_index(drop=True)
    return df

def load_chemical_distribution():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(base_dir, 'Smiles.xlsx')
    if not os.path.exists(file_path):
        return None
    
    try:
        # Sheet3 contains the distribution across L1-L8
        df = pd.read_excel(file_path, sheet_name='Sheet3')
        df = df.dropna(subset=['Compound'])
        
        # Helper to clean "0.55±0.04a" strings
        def extract_val(v):
            if pd.isna(v) or v == 'N/A' or v == '-': return 0.0
            try:
                s = str(v).split('±')[0].strip()
                s = re.sub(r'[^0-9.]', '', s)
                return float(s) if s else 0.0
            except: return 0.0
            
        loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
        for col in loc_cols:
            df[col] = df[col].apply(extract_val)
            
        return df
    except Exception:
        return None

data = load_and_process_data()
smiles_data = load_smiles_data()
dist_data = load_chemical_distribution()

if data is None or data.empty:
    st.warning("Could not load sample data.")
    st.stop()

# --- SIDEBAR ---
base_dir = os.path.dirname(os.path.abspath(__file__))
logo_path_png = os.path.join(base_dir, 'logo.png')
logo_path_jpg = os.path.join(base_dir, 'logo.jpg')

if os.path.exists(logo_path_png):
    try:
        logo = Image.open(logo_path_png)
        st.sidebar.image(logo, use_container_width=True)
    except Exception as e:
        st.sidebar.error(f"Error loading logo: {e}")
elif os.path.exists(logo_path_jpg):
    try:
        logo = Image.open(logo_path_jpg)
        st.sidebar.image(logo, use_container_width=True)
    except Exception as e:
        st.sidebar.error(f"Error loading logo: {e}")

st.sidebar.title(" Quick Panel")
st.sidebar.markdown("Explore climatic descriptors and phytochemical taxonomy summaries.")

# Sidebar Metric
total_locs = len(data)
total_regions = data['Region'].nunique() if data is not None else 0
total_compounds = len(smiles_data) if smiles_data is not None else 0
st.sidebar.metric(label="Total Samples", value=f"{total_locs} Samples")
st.sidebar.metric(label="Sampling Sites", value=f"{total_regions} Unique Sites")
st.sidebar.metric(label="Extracted Compounds", value=f"{total_compounds} Molecules")
st.sidebar.divider()

st.sidebar.divider()
st.sidebar.markdown("### 📊 Status")

# Connect to external API for live access counter
try:
    api_url = "https://api.counterapi.dev/v1/rosmarinus_spainforests/app_visits/up"
    res = requests.get(api_url, timeout=3)
    if res.status_code == 200:
        visit_count = res.json().get('count', 'N/A')
    else:
        visit_count = "Unavailable"
except Exception:
    visit_count = "Unavailable"
    
st.sidebar.markdown(f"👁️ **Page Views:** {visit_count}")

# --- TOP KPI ROW ---
col1, col2, col3, col4 = st.columns(4)
with col1:
    st.metric("Altitude & Relief", "260 - 1120 m")
with col2:
    st.metric("Historical Temperatures", "10.9 to 18.0 °C")
with col3:
    st.metric("Rainfall Regime", "267 - 688 mm")
with col4:
    st.metric("Diversity", f"+{total_compounds} Volatiles")

st.write("---")

# --- TABS FOR CLEAN LAYOUT ---
tab0, tab1, tab2, tab3 = st.tabs([
    "📊 Overall Analytics", 
    "📍 Geographic & Climate Mapping", 
    "🧪 Chemical Profile (SMILES)", 
    "🗃️ Raw Data Repository"
])

with tab0:
    st.markdown("### 📈 Multivariate Data Insights")
    
    if dist_data is not None:
        c1, c2 = st.columns([2, 1])
        
        with c1:
            # Chart 1: Chemical Diversity per Location
            loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
            diversity = (dist_data[loc_cols] > 0).sum().reset_index()
            diversity.columns = ['Site', 'Compound Count']
            
            fig_div = px.bar(
                diversity, x='Site', y='Compound Count',
                title="Chemical Diversity (Number of detected compounds per Site)",
                color='Compound Count',
                color_continuous_scale='Viridis',
                text_auto=True
            )
            st.plotly_chart(fig_div, use_container_width=True)
            
        with c2:
            st.markdown("#### Site Summary")
            st.write("Quantitative distribution of volatile profiles based on endemic forest sampling.")
            st.dataframe(diversity, hide_index=True, use_container_width=True)

        st.divider()
        
        # Chart 2: Heatmap of main compounds
        st.markdown("#### Presence Heatmap (Top 15 Compounds)")
        # Get top 15 compounds by global presence
        dist_data['Global_Sum'] = dist_data[loc_cols].sum(axis=1)
        top_compounds = dist_data.nlargest(15, 'Global_Sum')
        
        heatmap_data = top_compounds.set_index('Compound')[loc_cols]
        fig_heat = px.imshow(
            heatmap_data,
            labels=dict(x="Sampling Site", y="Compound", color="Rel. Concentration"),
            x=loc_cols,
            y=heatmap_data.index,
            color_continuous_scale='GnBu',
            aspect="auto"
        )
        st.plotly_chart(fig_heat, use_container_width=True)
    else:
        st.info("Distribution data not found in 'Smiles.xlsx -> Sheet3'.")

with tab1:
    st.markdown("### Sample Distribution in the Iberian Peninsula")
    # Main map
    fig = px.scatter_mapbox(
        data, 
        lat="lat", 
        lon="lon", 
        hover_name="Region", 
        hover_data={"lat": False, "lon": False, "Province": True, "Altitude": True, "Rainfall (mm)": True, "Mean Ann T (°C)": True, "Soil reaction": True, "Sampling Date": True},
        labels={"Mean Ann T (°C)": "Mean Annual Temp (°C)", "Rainfall (mm)": "Rainfall (mm/yr)", "Soil reaction": "Soil Profile"},
        color="Region",
        size_max=15,
        zoom=5.5, 
        center={"lat": data['lat'].mean(), "lon": data['lon'].mean()},
        height=550
    )
    fig.update_layout(
        mapbox_style="open-street-map", 
        margin={"r":0,"t":0,"l":0,"b":0},
        legend_title_text='Sampling Sites'
    )
    fig.update_traces(marker=dict(size=14, opacity=0.8))
    
    st.plotly_chart(fig, use_container_width=True)

with tab2:
    if smiles_data is not None and not smiles_data.empty:
        st.markdown("### Essential Oil Molecular Library")
        
        # Add Cards representation
        cols = st.columns(4)
        for idx, row in smiles_data.iterrows():
            col = cols[idx % 4]
            with col:
                with st.container(border=True):
                    st.markdown(f"**{row['Compound']}**")
                    st.caption(f"⏱️ **Rt:** `{row['Rt (min)']} min`")
                    
                    # Static Image Loading (Anti-libXrender Error System)
                    img_path = get_mol_image_path(row['Compound'])
                    if img_path:
                        with open(img_path, 'r') as f:
                            svg_content = f.read()
                        st.image(svg_content, use_container_width=True)
                    else:
                        st.warning("Structure drawing not found in repository.")
                    
                    st.code(row['SMILES'])
                    
                    # Add locations info if available
                    if dist_data is not None:
                        comp_name = row['Compound']
                        match = dist_data[dist_data['Compound'] == comp_name]
                        if not match.empty:
                            loc_cols = ['L1', 'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8']
                            found_in = [l for l in loc_cols if match.iloc[0][l] > 0]
                            if found_in:
                                st.markdown(f"**📍 Detected in:** {', '.join(found_in)}")
    else:
        st.warning("Molecule data not found.")

with tab3:
    st.markdown("### Extensive Repository Database")
    st.write("Query or export the comprehensive dataset matrices underpinning this study.")
    
    with st.expander("📍 Geographic Data (localization_data.xlsx)", expanded=True):
        st.dataframe(data, use_container_width=True, hide_index=True)
        
    with st.expander("🧪 Chemical Data (Smiles.xlsx)", expanded=False):
        if smiles_data is not None:
            st.dataframe(smiles_data, use_container_width=True, hide_index=True)
