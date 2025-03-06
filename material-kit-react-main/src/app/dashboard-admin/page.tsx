'use client';

import * as React from 'react';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { TimeFilter } from '@/components/dashboard-admin/overview/time-filter';
import { Metrics } from '@/components/dashboard-admin/overview/metrics';

// Fake data for different time frames
const fakeStatsData = {
  '1d': {
    carsUsed: 45,
    averageAccidents: 2.3,
    averageScore: 85
  },
  '7d': {
    carsUsed: 156,
    averageAccidents: 3.1,
    averageScore: 82
  },
  '30d': {
    carsUsed: 487,
    averageAccidents: 2.8,
    averageScore: 84
  }
};

const fakeMetricsData = {
  '1d': {
    braking: 75,
    acceleration: 68,
    swerving: 82
  },
  '7d': {
    braking: 82,
    acceleration: 74,
    swerving: 88
  },
  '30d': {
    braking: 78,
    acceleration: 71,
    swerving: 85
  }
};

export default function Overview(): React.JSX.Element {
  const [timeFrame, setTimeFrame] = React.useState<'1d' | '7d' | '30d'>('1d');
  const [stats, setStats] = React.useState(fakeStatsData['1d']);
  const [metrics, setMetrics] = React.useState(fakeMetricsData['1d']);

  // Update stats when timeFrame changes
  React.useEffect(() => {
    setStats(fakeStatsData[timeFrame]);
    setMetrics(fakeMetricsData[timeFrame]);
    
    // TODO: Implement real API calls when backend is ready
    // fetch(`http://localhost:8000/api/overview-stats?timeFrame=${timeFrame}`)
    //   .then(response => response.json())
    //   .then(data => {
    //     setStats(data.stats);
    //     setMetrics(data.metrics);
    //   })
    //   .catch(error => console.error('Error fetching data:', error));
  }, [timeFrame]);

  return (
    <Grid container spacing={3}>
      <Grid xs={12}>
        <TimeFilter onFilterChange={setTimeFrame} selectedFilter={timeFrame} />
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="overline">
              Cars Used
            </Typography>
            <Typography variant="h4">{stats.carsUsed}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="overline">
              Average Accidents
            </Typography>
            <Typography variant="h4">{stats.averageAccidents.toFixed(1)}</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid lg={4} sm={6} xs={12}>
        <Card>
          <CardContent>
            <Typography color="text.secondary" variant="overline">
              Average Score
            </Typography>
            <Typography variant="h4">{stats.averageScore}/100</Typography>
          </CardContent>
        </Card>
      </Grid>
      <Grid xs={12}>
        <Metrics data={metrics} />
      </Grid>
    </Grid>
  );
}