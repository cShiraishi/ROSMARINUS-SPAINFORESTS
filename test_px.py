import pandas as pd
import plotly.express as px
import map_app
data = map_app.load_and_process_data()
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
print("Plotly Figure created successfully")
