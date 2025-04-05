'use client';

import React, { useEffect, useState } from 'react';
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardActions,
  AppBar, 
  Toolbar, 
  Stack,
  Divider,
  Avatar,
  Paper,
  useTheme,
  useMediaQuery,
  Fade,
  Slide,
  Zoom,
  IconButton
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { motion } from 'framer-motion';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import AssessmentIcon from '@mui/icons-material/Assessment';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import BusinessIcon from '@mui/icons-material/Business';
import PersonIcon from '@mui/icons-material/Person';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import LinkedInIcon from '@mui/icons-material/LinkedIn';
import TwitterIcon from '@mui/icons-material/Twitter';
import EmailIcon from '@mui/icons-material/Email';
import { paths } from '@/paths';
import { useRouter } from 'next/navigation';

// Motion components for animations
const MotionBox = motion(Box);
const MotionTypography = motion(Typography);
const MotionButton = motion(Button);
const MotionContainer = motion(Container);
const MotionGrid = motion(Grid);

// Styled components for enhanced visuals
const HeroSection = styled(Box)(({ theme }) => ({
  minHeight: '90vh',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  background: `linear-gradient(135deg, #0a192f 0%, #112240 100%)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  color: theme.palette.common.white,
  textAlign: 'center',
  padding: theme.spacing(4),
  position: 'relative',
  overflow: 'hidden',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,  
    right: 0,
    bottom: 0,
    background: 'radial-gradient(circle at 50% 50%, rgba(25, 118, 210, 0.1) 0%, rgba(25, 118, 210, 0) 70%)',
    zIndex: 0,
    animation: 'pulse 8s ease-in-out infinite'
  },
  '@keyframes pulse': {
    '0%': { opacity: 0.5 },
    '50%': { opacity: 0.8 },
    '100%': { opacity: 0.5 }
  }
}));

// Animated Gradient Mesh Background Component
const AnimatedBackgroundMesh = () => {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.7,
          overflow: 'hidden'
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#1E3A8A" stopOpacity="0.5">
                <animate attributeName="stopColor" 
                  values="#1E3A8A; #1E40AF; #1D4ED8; #1E3A8A" 
                  dur="15s" repeatCount="indefinite" />
              </stop>
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0.3">
                <animate attributeName="stopColor" 
                  values="#2563EB; #3B82F6; #60A5FA; #2563EB" 
                  dur="15s" repeatCount="indefinite" />
              </stop>
            </linearGradient>
            
            <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="15" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          
          {/* Animated mesh grid lines */}
          <g>
            <path d="M0,100 Q250,150 500,100 T1000,100" stroke="url(#gradient1)" strokeWidth="1" fill="none">
              <animate attributeName="d" 
                values="M0,100 Q250,150 500,100 T1000,100;
                       M0,110 Q250,80 500,120 T1000,110;
                       M0,100 Q250,150 500,100 T1000,100" 
                dur="20s" repeatCount="indefinite" />
            </path>
            
            <path d="M0,200 Q250,250 500,200 T1000,200" stroke="url(#gradient1)" strokeWidth="1" fill="none">
              <animate attributeName="d" 
                values="M0,200 Q250,250 500,200 T1000,200;
                       M0,220 Q250,180 500,230 T1000,220;
                       M0,200 Q250,250 500,200 T1000,200" 
                dur="25s" repeatCount="indefinite" />
            </path>
            
            <path d="M0,300 Q250,350 500,300 T1000,300" stroke="url(#gradient1)" strokeWidth="1" fill="none">
              <animate attributeName="d" 
                values="M0,300 Q250,350 500,300 T1000,300;
                       M0,320 Q250,280 500,340 T1000,320;
                       M0,300 Q250,350 500,300 T1000,300" 
                dur="22s" repeatCount="indefinite" />
            </path>
          </g>
          
          {/* Floating highlights */}
          <circle cx="20%" cy="30%" r="80" fill="url(#gradient1)" filter="url(#glow)" opacity="0.15">
            <animate attributeName="cy" values="30%;32%;30%" dur="15s" repeatCount="indefinite" />
          </circle>
          
          <circle cx="80%" cy="70%" r="120" fill="url(#gradient1)" filter="url(#glow)" opacity="0.1">
            <animate attributeName="cy" values="70%;65%;70%" dur="18s" repeatCount="indefinite" />
          </circle>
        </svg>
      </Box>
    );
  };
  // Digital Data Flow Animation Component
const DataFlowAnimation = () => {
    return (
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 0,
          opacity: 0.4
        }}
      >
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="dotGradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
              <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
            </radialGradient>
          </defs>
          
          {/* Animated data points */}
          <g className="data-points">
            {Array.from({ length: 8 }).map((_, i) => (
              <circle key={i} r="2" fill="#60A5FA">
                <animate 
                  attributeName="cx" 
                  values={`${Math.random() * 20}%;${Math.random() * 100}%;${Math.random() * 20}%`} 
                  dur={`${15 + Math.random() * 20}s`} 
                  repeatCount="indefinite" 
                />
                <animate 
                  attributeName="cy" 
                  values={`${Math.random() * 100}%;${Math.random() * 20}%;${Math.random() * 100}%`} 
                  dur={`${15 + Math.random() * 20}s`} 
                  repeatCount="indefinite" 
                />
              </circle>
            ))}
          </g>
          
          {/* Connecting lines representing data flow */}
          <g className="data-lines" stroke="#3B82F6" strokeWidth="0.5" opacity="0.5">
            <line x1="10%" y1="20%" x2="30%" y2="80%">
              <animate attributeName="x2" values="30%;40%;30%" dur="15s" repeatCount="indefinite" />
              <animate attributeName="y2" values="80%;60%;80%" dur="15s" repeatCount="indefinite" />
            </line>
            <line x1="70%" y1="10%" x2="90%" y2="60%">
              <animate attributeName="x2" values="90%;80%;90%" dur="18s" repeatCount="indefinite" />
              <animate attributeName="y2" values="60%;80%;60%" dur="18s" repeatCount="indefinite" />
            </line>
            <line x1="20%" y1="70%" x2="60%" y2="40%">
              <animate attributeName="x2" values="60%;50%;60%" dur="20s" repeatCount="indefinite" />
              <animate attributeName="y2" values="40%;50%;40%" dur="20s" repeatCount="indefinite" />
            </line>
          </g>
        </svg>
      </Box>
    );
  };
  
  

// Animated particles for hero section background
const ParticleBackground = () => {
  // Array of colors that complement your theme
  const particleColors = [
    'rgba(255, 228, 181, 0.8)', // Moccasin
    'rgba(255, 105, 180, 0.6)', // Hot pink
    'rgba(147, 112, 219, 0.7)', // Medium purple
    'rgba(64, 224, 208, 0.5)',  // Turquoise
    'rgba(255, 165, 0, 0.6)',   // Orange
  ];

  return (
    <Box sx={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 0,
      opacity: 0.3, // Slightly increased opacity
    }}>
      {[...Array(30)].map((_, i) => { // Increased particle count
        const size = Math.random() * 12 + 4; // More varied sizes
        return (
          <Box
            component={motion.div}
            key={i}
            sx={{
              position: 'absolute',
              width: size,
              height: size,
              backgroundColor: particleColors[Math.floor(Math.random() * particleColors.length)],
              boxShadow: '0 0 10px rgba(255, 255, 255, 0.3)',
              borderRadius: '50%',
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, Math.random() * -120 - 50],
              x: [0, (Math.random() - 0.5) * 70],
              opacity: [0, 0.9, 0],
              scale: [1, Math.random() * 0.4 + 0.8], // Subtle size variation during animation
            }}
            transition={{
              duration: Math.random() * 12 + 8,
              repeat: Infinity,
              ease: "linear",
            }}
          />
        );
      })}
    </Box>
  );
};

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
  position: 'relative',
  overflow: 'hidden',
  background: theme.palette.mode === 'light' ? 'white' : theme.palette.background.paper,
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: '4px',
    background: theme.palette.primary.main,
    borderRadius: '4px 4px 0 0',
  }
}));

const PricingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: theme.spacing(2),
  overflow: 'hidden',
  transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
  },
}));

const TeamMemberCard = styled(Card)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: theme.spacing(4),
  borderRadius: theme.spacing(2),
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: theme.shadows[10],
    '& .MuiAvatar-root': {
      transform: 'scale(1.05)',
      border: `4px solid ${theme.palette.secondary.main}`,
    }
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 140,
  height: 140,
  marginBottom: theme.spacing(2),
  border: `4px solid ${theme.palette.primary.main}`,
  transition: 'all 0.3s ease',
  boxShadow: theme.shadows[3],
  backgroundColor: theme.palette.primary.main,
  '& img': {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  }
}));

const ScrollDownButton = motion(styled(Button)(({ theme }) => ({
  position: 'absolute',
  bottom: theme.spacing(5),
  left: '50%',
  transform: 'translateX(-50%)',
  borderRadius: '50%',
  minWidth: 'auto',
  width: 50,
  height: 50,
  padding: 0,
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
})));

const FloatingElement = styled(motion.div)(({ theme }) => ({
  position: 'absolute',
  borderRadius: '50%',
  background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0))',
  backdropFilter: 'blur(8px)',
}));

// Add this new component for a modern circuit-board style background
const CircuitBoardBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.4
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="circuitGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.4">
              <animate
                attributeName="stopOpacity"
                values="0.4; 0.8; 0.4"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#64B5F6" stopOpacity="0.1">
              <animate
                attributeName="stopOpacity"
                values="0.1; 0.4; 0.1"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>
          <pattern id="circuitPattern" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
            <path
              d="M10 10h30v30h-30z"
              fill="none"
              stroke="url(#circuitGradient)"
              strokeWidth="0.5"
            >
              <animate
                attributeName="stroke-dasharray"
                values="0,150;150,150;150,0"
                dur="15s"
                repeatCount="indefinite"
              />
            </path>
            <circle cx="10" cy="10" r="2" fill="url(#circuitGradient)">
              <animate
                attributeName="r"
                values="2;3;2"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuitPattern)" />
        
        {/* Animated particles */}
        {[...Array(8)].map((_, i) => (
          <g key={i}>
            <circle r="2" fill="#90CAF9">
              <animate
                attributeName="cx"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${15 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${15 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${8 + Math.random() * 5}s`}
                repeatCount="indefinite"
              />
            </circle>
            <line
              stroke="#64B5F6"
              strokeWidth="0.5"
              opacity="0.3"
            >
              <animate
                attributeName="x1"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${20 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y1"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${20 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${20 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${20 + Math.random() * 10}s`}
                repeatCount="indefinite"
              />
            </line>
          </g>
        ))}
      </svg>
    </Box>
  );
};

const DrivingAnalyticsBackground = () => {
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 0,
        overflow: 'hidden',
        opacity: 0.4
      }}
    >
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          {/* Road gradient */}
          <linearGradient id="roadGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1E88E5" stopOpacity="0.4">
              <animate
                attributeName="stopOpacity"
                values="0.4; 0.8; 0.4"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
            <stop offset="100%" stopColor="#64B5F6" stopOpacity="0.1">
              <animate
                attributeName="stopOpacity"
                values="0.1; 0.4; 0.1"
                dur="4s"
                repeatCount="indefinite"
              />
            </stop>
          </linearGradient>

          {/* Road pattern */}
          <pattern id="roadPattern" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path d="M0,100 L200,100" stroke="url(#roadGradient)" strokeWidth="20" fill="none" />
            <path d="M20,100 L40,100" stroke="white" strokeWidth="2" strokeDasharray="20,20">
              <animate
                attributeName="stroke-dashoffset"
                values="0;40"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>

          {/* Warning icon pattern */}
          <pattern id="warningPattern" x="0" y="0" width="300" height="300" patternUnits="userSpaceOnUse">
            <path d="M150,50 L250,250 L50,250 Z" fill="none" stroke="#FFA726" strokeWidth="2">
              <animate
                attributeName="opacity"
                values="0.2;0.6;0.2"
                dur="3s"
                repeatCount="indefinite"
              />
            </path>
          </pattern>
        </defs>

        {/* Background layers */}
        <rect width="100%" height="100%" fill="url(#roadPattern)" />

        {/* Animated roads with cars */}
        {[...Array(3)].map((_, i) => (
          <g key={`road-${i}`}>
            <line
              y1={150 + i * 200}
              y2={150 + i * 200}
              x1="0"
              x2="100%"
              stroke="#90CAF9"
              strokeWidth="2"
              opacity="0.3"
            />
            
            {/* Cars */}
            <g>
              <path
                d="M0,0 L30,0 L40,10 L40,20 L30,30 L0,30 L0,0"
                fill="#90CAF9"
                opacity="0.6"
              >
                <animateMotion
                  path={`M-50,${150 + i * 200} L2000,${150 + i * 200}`}
                  dur={`${15 + Math.random() * 10}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0.2;0.6;0.2"
                  dur="3s"
                  repeatCount="indefinite"
                />
              </path>
              
              {/* Car lights */}
              <circle r="2" fill="#FFEB3B">
                <animateMotion
                  path={`M-45,${145 + i * 200} L2005,${145 + i * 200}`}
                  dur={`${15 + Math.random() * 10}s`}
                  repeatCount="indefinite"
                />
              </circle>
            </g>
          </g>
        ))}

        {/* Accident warning indicators */}
        {[...Array(2)].map((_, i) => (
          <g key={`warning-${i}`}>
            <path
              d="M-10,-10 L10,-10 L0,10 Z"
              fill="#FFA726"
              opacity="0.5"
            >
              <animateMotion
                path={`M${200 + i * 500},100 A50,50 0 0 1 ${250 + i * 500},150`}
                dur="3s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.2;0.6;0.2"
                dur="1s"
                repeatCount="indefinite"
              />
            </path>
          </g>
        ))}

        {/* Analysis data points */}
        {[...Array(10)].map((_, i) => (
          <g key={`data-${i}`}>
            <circle r="2" fill="#64B5F6">
              <animate
                attributeName="cx"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${8 + Math.random() * 5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="cy"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${8 + Math.random() * 5}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0;1;0"
                dur={`${4 + Math.random() * 3}s`}
                repeatCount="indefinite"
              />
            </circle>
          </g>
        ))}

        {/* Connection lines between data points */}
        <g stroke="#64B5F6" strokeWidth="0.5" opacity="0.3">
          {[...Array(5)].map((_, i) => (
            <line key={`line-${i}`}>
              <animate
                attributeName="x1"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${12 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y1"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${12 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="x2"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${12 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
              <animate
                attributeName="y2"
                values={`${Math.random() * 100}%;${Math.random() * 100}%`}
                dur={`${12 + Math.random() * 8}s`}
                repeatCount="indefinite"
              />
            </line>
          ))}
        </g>
      </svg>
    </Box>
  );
};

export default function HomePage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      if (scrollPosition > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }

      // Determine active section for animations
      const sections = ['hero', 'about', 'features', 'pricing', 'team'];
      sections.forEach((section) => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
            setActiveSection(section);
          }
        }
      });
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const features = [
    {
      icon: <SpeedIcon fontSize="large" sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Real-time Monitoring",
      description: "Track driving behavior in real-time with our sophisticated sensors and GPS technology that provide instant feedback."
    },
    {
      icon: <SecurityIcon fontSize="large" sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Safety Alerts",
      description: "Receive instant notifications for harsh braking, acceleration, or dangerous driving patterns to improve safety."
    },
    {
      icon: <AssessmentIcon fontSize="large" sx={{ fontSize: 40, color: theme.palette.primary.main }} />,
      title: "Comprehensive Analytics",
      description: "Access detailed reports and analytics to improve driving behavior and reduce risks based on data-driven insights."
    },
  ];

  const pricingPlans = [
    {
      title: "Basic",
      price: "SAR 99",
      period: "per month",
      description: "Perfect for individual drivers",
      features: [
        "Real-time monitoring",
        "Basic safety alerts",
        "Weekly reports",
        "1 vehicle"
      ],
      buttonText: "Get Started",
      buttonVariant: "outlined",
    },
    {
      title: "Professional",
      price: "SAR 299",
      period: "per month",
      description: "Ideal for families and small businesses",
      features: [
        "Everything in Basic",
        "Advanced safety alerts",
        "Daily detailed reports",
        "Up to 5 vehicles",
        "Geofencing capabilities"
      ],
      buttonText: "Get Started",
      buttonVariant: "contained",
      highlighted: true,
    },
    {
      title: "Enterprise",
      price: "SAR 899",
      period: "per month",
      description: "Designed for companies with large fleets",
      features: [
        "Everything in Professional",
        "Customized reports",
        "API access",
        "Unlimited vehicles",
        "24/7 support",
        "Custom integrations"
      ],
      buttonText: "Contact Us",
      buttonVariant: "outlined",
    },
  ];

  const teamMembers = [
    {
      name: "Eyad Al-sayed",
      role: "Electrical and Computer Engineer",
      photo: "/assets/eyad.png",
      initial: "E",
      bio: "Electrical and Computer Engineer passionate about embedded systems, IoT, robotics, and AI. Focused on leveraging these technologies to create innovative solutions and advance engineering.",
      social: {
        linkedin: "https://www.linkedin.com/in/eyad-alsaid/",
        email: "mailto:eyad6938sa@gmail.com"
      }
    },
    {
      name: "Abdullah Al-johani",
      role: "Electrical and Computer Engineer",
      photo: "/assets/abdullah.png",
      initial: "A",
      bio: "Electrical and Computer Engineering student specializing in cloud computing, certified as a Cloud Practitioner and Solution Architect. Skilled in deploying scalable solutions, including in AI.",
      social: {
        linkedin: "https://www.linkedin.com/in/a-aljohani/",
        email: "mailto:abdullah.suwailem.aljohani@gmail.com"
      }
    },
    {
      name: "Zahid Al-fahmi",
      role: "Electrical and Computer Engineer",
      photo: "/assets/zahid.png",
      initial: "Z",
      bio: "Senior student in Electrical and Computer Engineering with a passion for technology and innovation. Experienced in RTL, FPGA development, ISP, CNNs, embedded systems, and system integration.",
      social: {
        linkedin: "https://www.linkedin.com/in/zahid-alfahmi/",
        email: "mailto:zahid.alfahmi@example.com"
      }
    }
  ];

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
  };

  const staggerChildren = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Navigation Bar */}
      <AppBar 
        position="fixed" 
        elevation={scrolled ? 4 : 0} 
        sx={{ 
          backgroundColor: scrolled ? 'rgba(255, 255, 255, 0.95)' : 'transparent',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled ? `0 4px 20px rgba(0, 0, 0, 0.1)` : 'none',
          transition: 'all 0.3s ease-in-out',
        }}
      >
        <Toolbar sx={{ transition: 'all 0.3s ease' }}>
          <Box 
            component={motion.div}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography 
              variant="h6" 
              component="div" 
              sx={{ 
                fontWeight: 700, 
                color: scrolled ? 'primary.main' : 'white',
                cursor: 'pointer',
                mr: 2,
                transition: 'color 0.3s ease',
                fontSize: { xs: '1.2rem', md: '1.5rem' }
              }}
              onClick={() => router.push('/')}
            >
              SafeMotion
            </Typography>
          </Box>
          <Box sx={{ flexGrow: 1 }} />
          <Stack direction="row" spacing={2}>
            <Button 
              component={motion.button}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              variant={scrolled ? "outlined" : "text"} 
              color={scrolled ? "primary" : "inherit"}
              onClick={() => router.push(paths.auth.signIn)}
              sx={{ 
                fontWeight: 600,
                borderRadius: '50px',
                px: 2,
                color: scrolled ? 'primary.main' : 'white',
                borderColor: scrolled ? 'primary.main' : 'white',
              }}
            >
              Sign In
            </Button>
            <Button 
              component={motion.button}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              variant="contained" 
              color="primary" 
              onClick={() => router.push(paths.auth.signUp)}
              sx={{ 
                fontWeight: 600,
                borderRadius: '50px',
                px: 3,
                background: scrolled ? 'primary.main' : 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  background: scrolled ? 'primary.dark' : 'rgba(255, 255, 255, 0.3)',
                }
              }}
            >
              Get Started
            </Button>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
<HeroSection id="hero">
  <DrivingAnalyticsBackground />
  <AnimatedBackgroundMesh />
  <DataFlowAnimation />
  <ParticleBackground />
  
  {/* Add floating elements */}
  {[...Array(5)].map((_, i) => (
    <FloatingElement
      key={i}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ 
        opacity: [0.3, 0.6, 0.3],
        scale: [1, 1.2, 1],
        x: [0, Math.random() * 100 - 50, 0],
        y: [0, Math.random() * 100 - 50, 0],
      }}
      transition={{ 
        duration: 10 + i * 2,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      sx={{
        width: 100 + i * 50,
        height: 100 + i * 50,
        top: `${Math.random() * 80}%`,
        left: `${Math.random() * 80}%`,
        filter: 'blur(4px)',
      }}
    />
  ))}

  <MotionContainer 
    maxWidth="md"
    initial="hidden"
    animate="visible"
    variants={{
      hidden: { opacity: 0 },
      visible: {
        opacity: 1,
        transition: {
          staggerChildren: 0.3,
          delayChildren: 0.2
        }
      }
    }}
    sx={{ position: 'relative', zIndex: 1 }}
  >
    <MotionTypography 
      variant="h2" 
      //component="h1" 
      gutterBottom
      variants={{
        hidden: { opacity: 0, y: -50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 1,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      }}
      sx={{ 
        fontWeight: 800,
        mb: 3,
        fontSize: { xs: '2.5rem', md: '4rem' },
        background: 'linear-gradient(135deg, #ffffff 0%, #90caf9 100%)',
        backgroundClip: 'text',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        letterSpacing: '-0.02em',
        textShadow: '0 5px 15px rgba(0,0,0,0.1)',
        position: 'relative',
        '&::after': {
          content: '""',
          position: 'absolute',
          bottom: '-10px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '4px',
          background: 'linear-gradient(90deg, transparent, #90caf9, transparent)',
          borderRadius: '2px'
        }
      }}
    >
      SafeMotion
    </MotionTypography>

    <MotionTypography 
      variant="h5" 
      //component="p"
      variants={{
        hidden: { opacity: 0, y: 30 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 1,
            delay: 0.3,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      }}
      sx={{ 
        mb: 5,
        opacity: 0.9,
        maxWidth: '800px',
        margin: '0 auto',
        fontSize: { xs: '1.1rem', md: '1.3rem' },
        lineHeight: 1.6,
        textShadow: '0 2px 5px rgba(0,0,0,0.2)',
        position: 'relative'
      }}
    >
      Advanced monitoring and analytics to promote safer driving behaviors
      for individuals and companies across Saudi Arabia
    </MotionTypography>

    <MotionBox 
      component={motion.div}
      variants={{
        hidden: { opacity: 0, y: 50 },
        visible: { 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.8,
            delay: 0.5,
            ease: [0.6, -0.05, 0.01, 0.99]
          }
        }
      }}
    >
      <Stack 
        direction={{ xs: 'column', sm: 'row' }} 
        spacing={3} 
        justifyContent="center"
      >
        <Button 
          component={motion.button}
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 30px rgba(25, 118, 210, 0.6)'
          }}
          whileTap={{ scale: 0.95 }}
          variant="contained" 
          size="large" 
          onClick={() => router.push(paths.auth.signUp)}
          sx={{ 
            px: 5, 
            py: 1.8,
            borderRadius: '50px',
            fontSize: '1.1rem',
            fontWeight: 600,
            background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)',
            boxShadow: '0 10px 20px rgba(0,0,0,0.15)',
            transition: 'all 0.3s ease',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transition: 'all 0.5s ease',
            },
            '&:hover::before': {
              left: '100%'
            }
          }}
        >
          Get Started
        </Button>
        
        {/* Similar styling for Learn More button */}
      </Stack>
    </MotionBox>
  </MotionContainer>

  <ScrollDownButton 
    animate={{ 
      y: [0, 10, 0],
      opacity: [0.6, 1, 0.6],
      scale: [1, 1.1, 1]
    }}
    transition={{ 
      repeat: Infinity, 
      duration: 2,
      ease: "easeInOut"
    }}
    variant="text" 
    color="inherit" 
    onClick={() => {
      const element = document.getElementById('about');
      element?.scrollIntoView({ behavior: 'smooth' });
    }}
    sx={{
      '&:hover': {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        transform: 'scale(1.1)'
      }
    }}
  >
    <KeyboardArrowDownIcon sx={{ fontSize: 30 }} />
  </ScrollDownButton>
</HeroSection>

      {/* About Section */}
      <Box id="about" sx={{ py: 12, backgroundColor: '#f9fafc' }}>
        <Container>
          <MotionBox 
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={activeSection === 'about' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}>
              ABOUT OUR SYSTEM
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, position: 'relative', display: 'inline-block' }}>
              What We Offer
              <Box sx={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80px', 
                height: '4px', 
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px'
              }}></Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mt: 4, fontSize: '1.1rem' }}>
              Our Driving Behavior Analysis System uses advanced technology to monitor and analyze driving patterns, 
              helping to promote safer roads and reduce accidents.
            </Typography>
          </MotionBox>

          <Grid container spacing={8} justifyContent="center" alignItems="center">
            <Grid item xs={12} md={6}>
              <MotionBox 
                sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}
                initial={{ opacity: 0, x: -30 }}
                animate={activeSection === 'about' ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.2 }}
              >
                <Typography variant="h4" component="h3" gutterBottom sx={{ fontWeight: 700, mb: 3 }}>
                  Who We Serve
                </Typography>
                <Typography variant="body1" paragraph sx={{ fontSize: '1.1rem', mb: 4 }}>
                  Our advanced driving behavior analysis platform is designed to serve both individuals and organizations with customized solutions.
                </Typography>
                
                <Grid container spacing={4} sx={{ mt: 2 }}>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start', 
                      p: 3, 
                      borderRadius: 2,
                      bgcolor: 'rgba(25, 118, 210, 0.05)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        transform: 'translateY(-5px)',
                      }
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                        <PersonIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 600 }}>
                        Individual Drivers
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Improve your driving skills, ensure safety for family members, and potentially lower insurance costs.
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column',
                      alignItems: 'flex-start', 
                      p: 3, 
                      borderRadius: 2,
                      bgcolor: 'rgba(25, 118, 210, 0.05)',
                      height: '100%',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'rgba(25, 118, 210, 0.1)',
                        transform: 'translateY(-5px)',
                      }
                    }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
                        <BusinessIcon sx={{ fontSize: 32 }} />
                      </Avatar>
                      <Typography variant="h6" component="h4" gutterBottom sx={{ fontWeight: 600 }}>
                        Companies & Fleets
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Manage your fleet efficiently, reduce operational costs, and enhance driver safety and compliance.
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </MotionBox>
            </Grid>
            <Grid item xs={12} md={6}>
              <MotionBox 
                initial={{ opacity: 0, x: 30 }}
                animate={activeSection === 'about' ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7, delay: 0.4 }}
              >
                {/* Animated dashboard visualization */}
                <Box 
                  sx={{
                    width: '100%',
                    height: 350,
                    borderRadius: 4,
                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                    overflow: 'hidden',
                    position: 'relative',
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                  }}
                >
                  <Box
                    component={motion.div}
                    animate={{ 
                      y: [0, -5, 0], 
                      boxShadow: [
                        '0 20px 40px rgba(0,0,0,0.1)',
                        '0 25px 50px rgba(0,0,0,0.15)',
                        '0 20px 40px rgba(0,0,0,0.1)'
                      ]
                    }}
                    transition={{ duration: 4, repeat: Infinity, repeatType: 'reverse' }}
                    sx={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      p: 3,
                    }}
                  >
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, color: '#1e3c72' }}>Driving Analytics Dashboard</Typography>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        {[...Array(3)].map((_, i) => (
                          <Box key={i} sx={{ width: 12, height: 12, borderRadius: '50%', bgcolor: i === 0 ? '#ff5f57' : i === 1 ? '#febc2e' : '#28c840' }} />
                        ))}
                      </Box>
                    </Box>
                    
                    <Box sx={{ flexGrow: 1, display: 'flex', gap: 2, flexDirection: 'column' }}>
                      <Box sx={{ height: '40%', bgcolor: 'rgba(25, 118, 210, 0.1)', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <Typography variant="body2" color="text.secondary">Driving Score Trend</Typography>
                        <Box sx={{ flexGrow: 1, height: '100%', display: 'flex', alignItems: 'flex-end' }}>
                          {[...Array(7)].map((_, i) => {
                            const height = 40 + Math.random() * 40;
                            return (
                              <Box 
                                component={motion.div}
                                initial={{ height: 0 }}
                                animate={{ height: `${height}%` }}
                                transition={{ duration: 1, delay: i * 0.1 }}
                                key={i} 
                                sx={{ 
                                  width: '12%', 
                                  mx: '1%',
                                  bgcolor: 'primary.main',
                                  borderRadius: '4px 4px 0 0',
                                }} 
                              />
                            );
                          })}
                        </Box>
                      </Box>
                      
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <Box sx={{ height: 100, bgcolor: 'rgba(76, 175, 80, 0.1)', borderRadius: 2, p: 2, position: 'relative' }}>
                            <Typography variant="body2" color="text.secondary">Safety Score</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#4caf50' }}>92<Typography component="span" variant="body2">/100</Typography></Typography>
                            <Box 
                              component={motion.div}
                              initial={{ width: 0 }}
                              animate={{ width: '92%' }}
                              transition={{ duration: 1.5, delay: 0.5 }}
                              sx={{ position: 'absolute', bottom: 0, left: 0, height: '4px', bgcolor: '#4caf50', borderRadius: 2 }} 
                            />
                          </Box>
                        </Grid>
                        <Grid item xs={6}>
                          <Box sx={{ height: 100, bgcolor: 'rgba(244, 67, 54, 0.1)', borderRadius: 2, p: 2, position: 'relative' }}>
                            <Typography variant="body2" color="text.secondary">Risk Level</Typography>
                            <Typography variant="h4" sx={{ fontWeight: 700, color: '#f44336' }}>Low</Typography>
                            <Box 
                              component={motion.div}
                              initial={{ width: 0 }}
                              animate={{ width: '30%' }}
                              transition={{ duration: 1.5, delay: 0.7 }}
                              sx={{ position: 'absolute', bottom: 0, left: 0, height: '4px', bgcolor: '#f44336', borderRadius: 2 }} 
                            />
                          </Box>
                        </Grid>
                      </Grid>
                    </Box>
                  </Box>
                </Box>
              </MotionBox>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 12, position: 'relative' }}>
        {/* Background decoration */}
        <Box 
          sx={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            width: '100%', 
            height: '100%', 
            background: 'linear-gradient(135deg, rgba(25, 118, 210, 0.03) 0%, rgba(25, 118, 210, 0) 100%)',
            zIndex: -1,
          }}
        />
        <Container>
          <MotionBox 
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={activeSection === 'features' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}>
              FEATURES
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, position: 'relative', display: 'inline-block' }}>
              Key Capabilities
              <Box sx={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80px', 
                height: '4px', 
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px'
              }}></Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mt: 4, fontSize: '1.1rem' }}>
              Our system offers a comprehensive suite of features designed to monitor, analyze, and improve driving behavior for safer roads.
            </Typography>
          </MotionBox>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={4} key={index}>
                <MotionBox 
                  component={motion.div}
                  initial={{ opacity: 0, y: 50 }}
                  animate={activeSection === 'features' ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.2 }}
                  sx={{ height: '100%' }}
                >
                  <FeatureCard elevation={3}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        width: 70,
                        height: 70,
                        borderRadius: '50%',
                        backgroundColor: 'rgba(25, 118, 210, 0.08)',
                        mb: 2,
                      }}>
                        {feature.icon}
                      </Box>
                    </Box>
                    <Typography variant="h5" component="h3" sx={{ fontWeight: 700, mb: 2 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ flexGrow: 1 }}>
                      {feature.description}
                    </Typography>
                  </FeatureCard>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box id="pricing" sx={{ py: 12, backgroundColor: '#f9fafc' }}>
        <Container>
          <MotionBox 
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={activeSection === 'pricing' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}>
              PRICING
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, position: 'relative', display: 'inline-block' }}>
              Subscription Plans
              <Box sx={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80px', 
                height: '4px', 
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px'
              }}></Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mt: 4, fontSize: '1.1rem' }}>
              Choose the plan that best fits your needs. All plans include core features with increasing capabilities as you scale.
            </Typography>
          </MotionBox>

          <Grid container spacing={4} alignItems="stretch">
            {pricingPlans.map((plan, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <MotionBox 
                  component={motion.div}
                  initial={{ opacity: 0, y: 50 }}
                  animate={activeSection === 'pricing' ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.2 }}
                  sx={{ height: '100%' }}
                >
                  <PricingCard elevation={plan.highlighted ? 8 : 1}>
                    <CardContent sx={{ 
                      flexGrow: 1, 
                      p: 4,
                      bgcolor: plan.highlighted ? 'primary.main' : 'background.paper',
                      color: plan.highlighted ? 'primary.contrastText' : 'inherit',
                      position: 'relative',
                      overflow: 'hidden'
                    }}>
                      {plan.highlighted && (
                        <Box sx={{ 
                          position: 'absolute', 
                          top: 20, 
                          right: -35, 
                          transform: 'rotate(45deg)',
                          bgcolor: theme.palette.secondary.main,
                          color: theme.palette.secondary.contrastText,
                          px: 4,
                          py: 0.5,
                          width: 150,
                          textAlign: 'center',
                          fontWeight: 'bold',
                          fontSize: '0.8rem',
                          zIndex: 1,
                          boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                        }}>
                          POPULAR
                        </Box>
                      )}
                      
                      <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                        {plan.title}
                      </Typography>
                      <Box sx={{ my: 3 }}>
                        <Typography variant="h3" component="span" fontWeight={800} sx={{ letterSpacing: '-0.02em' }}>
                          {plan.price}
                        </Typography>
                        <Typography variant="subtitle1" component="span" sx={{ ml: 1, opacity: 0.7 }}>
                          {plan.period}
                        </Typography>
                      </Box>
                      <Typography color={plan.highlighted ? 'inherit' : 'text.secondary'} paragraph>
                        {plan.description}
                      </Typography>
                      <Divider sx={{ my: 3, borderColor: plan.highlighted ? 'rgba(255,255,255,0.2)' : 'divider' }} />
                      <Box sx={{ mt: 3 }}>
                        {plan.features.map((feature, idx) => (
                          <Box key={idx} sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <CheckCircleIcon sx={{ 
                              mr: 1.5, 
                              fontSize: 20,
                              color: plan.highlighted ? 'primary.contrastText' : 'success.main'
                            }} />
                            <Typography variant="body2">
                              {feature}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
                    </CardContent>
                    <CardActions sx={{ p: 4, bgcolor: plan.highlighted ? 'primary.dark' : 'background.paper' }}>
                      <Button 
                        component={motion.button}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        fullWidth 
                        variant={plan.buttonVariant as "text" | "outlined" | "contained"}
                        color={plan.highlighted ? 'secondary' : 'primary'}
                        size="large"
                        onClick={() => router.push(paths.auth.signUp)}
                        sx={{ 
                          py: 1.5,
                          borderRadius: '50px',
                          fontWeight: 600
                        }}
                      >
                        {plan.buttonText}
                      </Button>
                    </CardActions>
                  </PricingCard>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
          
          <MotionBox 
            sx={{ textAlign: 'center', mt: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={activeSection === 'pricing' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.8 }}
          >
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Need a custom solution for your specific requirements?
            </Typography>
            <Button 
              component={motion.button}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              variant="text" 
              color="primary" 
              size="large"
              sx={{ fontWeight: 600 }}
              onClick={() => router.push('/contact')}
            >
              Contact our sales team
            </Button>
          </MotionBox>
        </Container>
      </Box>

      {/* Our Team Section */}
      <Box id="team" sx={{ py: 12 }}>
        <Container>
          <MotionBox 
            sx={{ textAlign: 'center', mb: 8 }}
            initial={{ opacity: 0, y: 30 }}
            animate={activeSection === 'team' ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 600, letterSpacing: 2 }}>
              OUR TEAM
            </Typography>
            <Typography variant="h3" component="h2" sx={{ fontWeight: 800, mb: 2, position: 'relative', display: 'inline-block' }}>
              Meet The Creators
              <Box sx={{ 
                position: 'absolute', 
                bottom: '-10px', 
                left: '50%', 
                transform: 'translateX(-50%)', 
                width: '80px', 
                height: '4px', 
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px'
              }}></Box>
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: '800px', mx: 'auto', mt: 4, fontSize: '1.1rem' }}>
              Our passionate team combines technical expertise and industry knowledge to deliver a superior driving analytics platform.
            </Typography>
          </MotionBox>

          <Grid container spacing={4} justifyContent="center">
            {teamMembers.map((member, index) => (
              <Grid item key={index} xs={12} sm={6} md={4}>
                <MotionBox 
                  component={motion.div}
                  initial={{ opacity: 0, y: 50 }}
                  animate={activeSection === 'team' ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.7, delay: 0.2 + index * 0.2 }}
                >
                  <TeamMemberCard elevation={3}>
                    <StyledAvatar
                      src={member.photo}
                      alt={member.name}
                    />
                    <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                      {member.name}
                    </Typography>
                    <Typography variant="subtitle1" color="primary" gutterBottom fontWeight={600}>
                      {member.role}
                    </Typography>
                    <Divider sx={{ width: '50px', my: 2 }} />
                    <Typography variant="body2" color="text.secondary" align="center">
                      {member.bio}
                    </Typography>
                    <Box sx={{ display: 'flex', mt: 3, gap: 1.5 }}>
                      <IconButton
                        component="a"
                        href={member.social.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <LinkedInIcon />
                      </IconButton>
                      <IconButton
                        component="a"
                        href={member.social.email}
                        target="_blank"
                        rel="noopener noreferrer"
                        size="small"
                        sx={{
                          color: 'primary.main',
                          '&:hover': {
                            backgroundColor: 'rgba(25, 118, 210, 0.08)'
                          }
                        }}
                      >
                        <EmailIcon />
                      </IconButton>
                    </Box>
                  </TeamMemberCard>
                </MotionBox>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 8, bgcolor: '#141B2D' }}>
        <Container>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 700, mb: 3 }}>
                SafeMotion
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 3 }}>
                Advanced technology for safer roads and better driving habits through real-time monitoring and analysis.
              </Typography>
              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {['Facebook', 'Twitter', 'LinkedIn', 'Instagram'].map((social) => (
                  <Box 
                    key={social}
                    component={motion.div}
                    whileHover={{ y: -5 }}
                    sx={{ 
                      width: 40, 
                      height: 40, 
                      borderRadius: '50%', 
                      bgcolor: 'rgba(255,255,255,0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        bgcolor: 'primary.main',
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ color: 'white', fontSize: '0.6rem' }}>
                      {social.charAt(0)}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                Quick Links
              </Typography>
              <Box component="ul" sx={{ p: 0, listStyle: 'none' }}>
                {['Home', 'Features', 'Pricing', 'About Us'].map((item) => (
                  <Box component="li" key={item} sx={{ mb: 1.5 }}>
                    <Typography 
                      component={motion.a}
                      whileHover={{ x: 5 }}
                      variant="body2" 
                      href="#" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textDecoration: 'none', 
                        display: 'inline-block',
                        '&:hover': { color: 'white' } 
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={2}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                For Users
              </Typography>
              <Box component="ul" sx={{ p: 0, listStyle: 'none' }}>
                {['Sign Up', 'Log In', 'FAQ', 'Support'].map((item) => (
                  <Box component="li" key={item} sx={{ mb: 1.5 }}>
                    <Typography 
                      component={motion.a}
                      whileHover={{ x: 5 }}
                      variant="body2" 
                      href="#" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.7)', 
                        textDecoration: 'none', 
                        display: 'inline-block',
                        '&:hover': { color: 'white' } 
                      }}
                    >
                      {item}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="subtitle1" fontWeight={700} gutterBottom sx={{ color: 'white' }}>
                Contact Us
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                King Abdulaziz University, Jeddah, Saudi Arabia
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)', mb: 2 }}>
                Email: info@drivinganalysis.com
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Phone: +966 12 345 6789
              </Typography>
              <Box sx={{ mt: 4 }}>
                <form>
                  <Typography variant="subtitle2" sx={{ color: 'white', mb: 1.5 }}>
                    Subscribe to our newsletter
                  </Typography>
                  <Box sx={{ display: 'flex' }}>
                    <Box 
                      component="input" 
                      placeholder="Your email" 
                      sx={{ 
                        flex: 1,
                        p: 1.5,
                        border: 'none',
                        borderRadius: '50px 0 0 50px',
                        outline: 'none'
                      }} 
                    />
                    <Button 
                      variant="contained" 
                      color="primary" 
                      sx={{ 
                        borderRadius: '0 50px 50px 0',
                        px: 2
                      }}
                    >
                      Subscribe
                    </Button>
                  </Box>
                </form>
              </Box>
            </Grid>
          </Grid>
          <Divider sx={{ my: 4, borderColor: 'rgba(255,255,255,0.1)' }} />
          <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' }}>
            <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
              © {new Date().getFullYear()} SafeMotion. All rights reserved.
            </Typography>
            <Stack direction="row" spacing={2}>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Privacy Policy
              </Typography>
              <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.5)' }}>
                Terms of Service
              </Typography>
            </Stack>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}