// RiskAssessment.tsx
import * as React from 'react';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import dynamic from 'next/dynamic';

// Dynamically import ApexCharts to avoid SSR issues
const Chart = dynamic(() => import('react-apexcharts'), { ssr: false });

interface RiskAssessmentProps {
  data: {
    high: number;
    medium: number;
    low: number;
  };
}

export function RiskAssessment({ data }: RiskAssessmentProps) {
  const totalDrivers = data.high + data.medium + data.low;
  
  const chartOptions = {
    chart: {
      background: 'transparent',
      toolbar: {
        show: false
      }
    },
    colors: ['#F44336', '#FF9800', '#4CAF50'],
    labels: ['High Risk', 'Medium Risk', 'Low Risk'],
    plotOptions: {
      pie: {
        donut: {
          size: '65%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: '14px',
              fontWeight: 600,
              color: '#334155'
            },
            value: {
              show: true,
              fontSize: '16px',
              color: '#334155',
              formatter: (val: number) => `${val}`
            },
            total: {
              show: true,
              label: 'Total',
              fontSize: '14px',
              color: '#64748B',
              formatter: () => `${totalDrivers}`
            }
          }
        }
      }
    },
    dataLabels: {
      enabled: false
    },
    stroke: {
      width: 2,
      colors: ['#FFF']
    },
    legend: {
      position: 'bottom',
      fontSize: '14px',
      markers: {
        width: 12,
        height: 12,
        radius: 12
      },
      itemMargin: {
        horizontal: 8
      }
    }
  };

  const series = [data.high, data.medium, data.low];

  return (
    <Card>
      <CardContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="h6" gutterBottom>
              Risk Assessment
            </Typography>
            <Typography color="text.secondary" variant="body2">
              Driver risk level based on safety scores
            </Typography>
          </Box>
          
          <Box sx={{ height: 300 }}>
            {typeof window !== 'undefined' && (
              <Chart
                height={300}
                options={chartOptions}
                series={series}
                type="donut"
              />
            )}
          </Box>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <Box>
              <Typography variant="body2" color="error.main" fontWeight="medium">
                High Risk: {((data.high / totalDrivers) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="warning.main" fontWeight="medium">
                Medium Risk: {((data.medium / totalDrivers) * 100).toFixed(1)}%
              </Typography>
            </Box>
            <Box>
              <Typography variant="body2" color="success.main" fontWeight="medium">
                Low Risk: {((data.low / totalDrivers) * 100).toFixed(1)}%
              </Typography>
            </Box>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}