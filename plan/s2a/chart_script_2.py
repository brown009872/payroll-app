
import plotly.graph_objects as go

# Data
categories = ["Critical Issues", "Important Issues", "Technical Issues"]
counts = [3, 3, 2]
percentages = [37.5, 37.5, 25]

# Colors: red for Critical, orange for Important, yellow for Technical
colors = ['#DB4545', '#FF8C00', '#D2BA4C']

# Create donut chart
fig = go.Figure(data=[go.Pie(
    labels=categories,
    values=counts,
    hole=0.4,  # Creates donut chart
    marker=dict(colors=colors),
    textposition='inside',
    textinfo='percent',
    hovertemplate='<b>%{label}</b><br>Count: %{value}<br>Percentage: %{percent}<extra></extra>'
)])

# Update layout with title and subtitle
fig.update_layout(
    title={
        "text": "Improvements by Criticality Level<br><span style='font-size: 18px; font-weight: normal;'>Critical and Important issues equally prioritized</span>"
    },
    uniformtext_minsize=14,
    uniformtext_mode='hide'
)

# Save as PNG and SVG
fig.write_image("chart.png")
fig.write_image("chart.svg", format="svg")
