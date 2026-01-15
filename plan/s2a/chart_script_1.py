
import plotly.graph_objects as go
import plotly.io as pio

# Data for the phases
phases_data = {
    "phases": [
        {"name": "Phase 1: Core Development", "start": 1, "duration": 2, "effort": 40},
        {"name": "Phase 2: Testing", "start": 2, "duration": 2, "effort": 30},
        {"name": "Phase 3: Enhancements", "start": 3, "duration": 2, "effort": 20},
        {"name": "Phase 4: Launch Prep", "start": 4, "duration": 1, "effort": 10}
    ]
}

# Colors for each phase (using the brand colors)
colors = ['#1FB8CD', '#DB4545', '#2E8B57', '#5D878F']

# Create the figure
fig = go.Figure()

# Add bars for each phase
for i, phase in enumerate(phases_data['phases']):
    fig.add_trace(go.Bar(
        y=[phase['name']],
        x=[phase['duration']],
        base=[phase['start']],
        orientation='h',
        marker=dict(color=colors[i]),
        text=[f"{phase['effort']}% effort"],
        textposition='inside',
        textfont=dict(color='white', size=12),
        hovertemplate=f"<b>{phase['name']}</b><br>Days: {phase['start']}-{phase['start']+phase['duration']}<br>Effort: {phase['effort']}%<extra></extra>",
        showlegend=False,
        cliponaxis=False
    ))

# Calculate week boundaries (assuming 5 days span 3 weeks for labeling purposes)
# Days 1-5 divided into 3 weeks
week_boundaries = [1, 2.33, 3.67, 5]

# Update layout with week labels and formatting
fig.update_layout(
    title={
        "text": "Implementation Timeline Across 3 Weeks<br><span style='font-size: 18px; font-weight: normal;'>Overlapping phases optimize resource allocation</span>"
    },
    xaxis=dict(
        title="Timeline (Days)",
        tickmode='linear',
        tick0=1,
        dtick=1,
        range=[0.5, 5.5],
        showgrid=True,
        gridcolor='lightgray'
    ),
    yaxis=dict(
        title="",
        autorange='reversed'
    ),
    barmode='overlay',
    plot_bgcolor='white',
    bargap=0.3
)

# Add week labels as annotations at the top
week_labels = ['WEEK 1', 'WEEK 2', 'WEEK 3']
week_centers = [1.665, 3, 4.335]

for i, (label, center) in enumerate(zip(week_labels, week_centers)):
    fig.add_annotation(
        x=center,
        y=1.15,
        text=f"<b>{label}</b>",
        showarrow=False,
        yref='paper',
        xref='x',
        font=dict(size=11, color='#13343B'),
        bgcolor='rgba(255, 255, 255, 0.8)',
        bordercolor='#13343B',
        borderwidth=1,
        borderpad=4
    )

# Add vertical lines to separate weeks
for boundary in week_boundaries[1:-1]:
    fig.add_vline(
        x=boundary, 
        line_dash="dot", 
        line_color="gray", 
        line_width=1,
        opacity=0.5
    )

# Save the chart
fig.write_image("gantt_timeline.png")
fig.write_image("gantt_timeline.svg", format="svg")
