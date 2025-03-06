import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Chart } from '@/components/core/chart';

interface MetricsProps {
  data: {
    braking: number;
    acceleration: number;
    swerving: number;
  };
}

export function Metrics({ data }: MetricsProps) {
  const chartOptions = {
    chart: {
      background: 'transparent'
    },
    labels: ['Harsh Braking', 'Harsh Acceleration', 'Swerving'],
    plotOptions: {
      radialBar: {
        dataLabels: {
          name: {
            color: '#6B7280'
          },
          value: {
            color: '#111827'
          }
        }
      }
    }
  };

  return (
    <Card>
      <CardContent>
        <Stack spacing={3}>
          <Stack spacing={1}>
            <Typography color="text.secondary" variant="overline">
              Driving Metrics
            </Typography>
            <Typography variant="h4">Events Detection</Typography>
          </Stack>
          <Chart 
            height={300}
            options={chartOptions}
            series={[data.braking, data.acceleration, data.swerving]}
            type="radialBar"
          />
        </Stack>
      </CardContent>
    </Card>
  );
}