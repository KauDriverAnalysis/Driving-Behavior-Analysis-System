'use client';

import * as React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SpeedIcon from '@mui/icons-material/Speed';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import WarningIcon from '@mui/icons-material/Warning';
import CrisisAlertIcon from '@mui/icons-material/CrisisAlert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface SimulationResultsProps {
  data: {
    summary: any;
    events: any;
    chartData: any[];
    segments: any[];
  };
}

export function SimulationResults({ data }: SimulationResultsProps) {
  const accidentDetected = data.summary.accident_detected !== undefined ? data.summary.accident_detected : false;

  return (
    <Box>
      <Card sx={{ mb: 3, mt: 3 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom align="center">
            Accident Status
          </Typography>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mt: 2 }}>
            {accidentDetected ? (
              <>
                <CrisisAlertIcon sx={{ fontSize: 64, color: '#f44336', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#f44336', mb: 1 }}>
                  ACCIDENT DETECTED
                </Typography>
                {data.summary.accident_time && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Time:</strong> {data.summary.accident_time}
                  </Typography>
                )}
                {data.summary.accident_location && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Location:</strong> {data.summary.accident_location}
                  </Typography>
                )}
                {data.summary.accident_type && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Type:</strong> {data.summary.accident_type}
                  </Typography>
                )}
                {data.summary.involved_parties && (
                  <Typography variant="body1" color="text.secondary">
                    <strong>Involved Parties:</strong> {data.summary.involved_parties}
                  </Typography>
                )}
                {data.summary.accident_severity && (
                  <Typography variant="body1" color="error">
                    <strong>Severity:</strong> {data.summary.accident_severity}
                  </Typography>
                )}
                {data.summary.recommendation && (
                  <Typography variant="body2" color="warning.main" sx={{ mt: 2 }}>
                    <strong>Recommendation:</strong> {data.summary.recommendation}
                  </Typography>
                )}
                <Typography variant="body2" color="error" sx={{ mt: 2 }}>
                  Please review the accident details and take necessary action.
                </Typography>
              </>
            ) : (
              <>
                <CheckCircleIcon sx={{ fontSize: 64, color: '#4caf50', mb: 2 }} />
                <Typography variant="h4" fontWeight="bold" sx={{ color: '#4caf50', mb: 1 }}>
                  SAFE
                </Typography>
                <Typography variant="body1" color="success.main">
                  No accident detected in this simulation.
                </Typography>
              </>
            )}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}