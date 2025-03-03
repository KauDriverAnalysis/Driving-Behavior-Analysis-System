// src/components/dashboard/tracking/CarDetailPanel.tsx
import * as React from 'react';
import { Card, CardHeader, CardContent, Typography, Divider, Box, Grid } from '@mui/material';

interface DrivingDataDetail {
  car_id: string;
  distance: number;
  harsh_braking_events: number;
  harsh_acceleration_events: number;
  swerving_events: number;
  potential_swerving_events: number;
  over_speed_events: number;
  score: number;
  // Add any other fields you need
}

interface CarDetailPanelProps {
  data: DrivingDataDetail;
}

export default function CarDetailPanel({ data }: CarDetailPanelProps): React.JSX.Element {
  return (
    <Card sx={{ mt: 2 }}>
      <CardHeader title={`Car ${data.car_id} Details`} />
      <Divider />
      <CardContent>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Distance
            </Typography>
            <Typography variant="body1">{data.distance} km</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Score
            </Typography>
            <Typography variant="body1">{data.score}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Harsh Braking
            </Typography>
            <Typography variant="body1">{data.harsh_braking_events}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Harsh Acceleration
            </Typography>
            <Typography variant="body1">{data.harsh_acceleration_events}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Swerving Events
            </Typography>
            <Typography variant="body1">{data.swerving_events}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Potential Swerving
            </Typography>
            <Typography variant="body1">{data.potential_swerving_events}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography variant="subtitle2" color="text.secondary">
              Over Speed Events
            </Typography>
            <Typography variant="body1">{data.over_speed_events}</Typography>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}