import React, { useState, useEffect, useMemo } from 'react';
import {
    Container,
    Grid,
    Typography,
    Box,
    Card,
    CardContent,
    CircularProgress,
    Alert,
    Paper,
    Divider,
    LinearProgress,
    Stack,
    useTheme
} from '@mui/material';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
    AreaChart,
    Area
} from 'recharts';
import {
    TrendingUp as TrendingIcon,
    Article as PostsIcon,
    Comment as CommentsIcon,
    EmojiEvents as ChampionIcon,
    Timeline as GrowthIcon,
    CompareArrows as AvgIcon
} from '@mui/icons-material';
import axios from 'axios';
import { useAuth } from '../hooks/useAuth';
import { Link } from 'react-router-dom';

const AnalyticsDashboard: React.FC = () => {
    const { token, isAuthenticated, loading: authLoading } = useAuth();
    const theme = useTheme();

    const [metrics, setMetrics] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isAuthenticated) {
            fetchMetrics();
        }
    }, [isAuthenticated]);

    const fetchMetrics = async () => {
        try {
            setLoading(true);
            const res = await axios.get('/api/analytics/dashboard', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMetrics(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load analytics');
        } finally {
            setLoading(false);
        }
    };

    // Transform recentAnalytics for the chart
    const chartData = useMemo(() => {
        if (!metrics?.recentAnalytics) return [];

        const aggregated = metrics.recentAnalytics.reduce((acc: any, curr: any) => {
            const date = new Date(curr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            if (!acc[date]) acc[date] = { date, views: 0 };
            acc[date].views += curr.views;
            return acc;
        }, {});

        return Object.values(aggregated);
    }, [metrics]);

    const avgViewsPerDay = useMemo(() => {
        if (!chartData.length) return 0;
        const total = chartData.reduce((sum: number, day: any) => sum + day.views, 0);
        return Math.round(total / chartData.length);
    }, [chartData]);

    const mostPopularPost = metrics?.topPosts?.[0];

    if (authLoading || loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
                <CircularProgress size={60} thickness={4} />
            </Box>
        );
    }

    if (!isAuthenticated) {
        return (
            <Container sx={{ mt: 10 }}>
                <Alert severity="warning">Please login to view your analytics.</Alert>
            </Container>
        );
    }

    if (error) {
        return (
            <Container sx={{ mt: 10 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    return (
        <Box sx={{ py: 6, bgcolor: 'grey.50', minHeight: '100vh' }}>
            <Container maxWidth="lg">
                <Typography variant="h3" fontWeight={800} gutterBottom>
                    Analytics Dashboard
                </Typography>
                <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
                    Track your growth and understand your audience.
                </Typography>

                {/* Top Summary Metrics */}
                <Grid container spacing={3} sx={{ mb: 6 }}>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(45deg, #1976d2 30%, #42a5f5 90%)', color: 'white' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h3" fontWeight={800}>{metrics?.totalViews || 0}</Typography>
                                    <Typography variant="h6" sx={{ opacity: 0.8 }}>Total Lifetime Views</Typography>
                                </Box>
                                <TrendingIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'white', border: '1px solid', borderColor: 'grey.200' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box>
                                    <Typography variant="h3" fontWeight={800} color="primary">{avgViewsPerDay}</Typography>
                                    <Typography variant="h6" color="text.secondary">Avg Views / Day</Typography>
                                </Box>
                                <AvgIcon sx={{ fontSize: 40, color: 'primary.light', opacity: 0.5 }} />
                            </Box>
                        </Paper>
                    </Grid>
                    <Grid size={{ xs: 12, md: 4 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, bgcolor: 'secondary.main', color: 'white' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                                <Box sx={{ maxWidth: '80%' }}>
                                    <Typography variant="h5" fontWeight={800} noWrap>{mostPopularPost?.title || 'None'}</Typography>
                                    <Typography variant="subtitle1" sx={{ opacity: 0.8 }}>Most Popular Post</Typography>
                                </Box>
                                <ChampionIcon sx={{ fontSize: 40, opacity: 0.5 }} />
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                <Grid container spacing={4}>
                    {/* Main Chart */}
                    <Grid size={{ xs: 12, lg: 8 }}>
                        <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" sx={{ mb: 4 }}>
                                <Typography variant="h6" fontWeight={700} display="flex" alignItems="center" gap={1}>
                                    <GrowthIcon color="primary" /> Traffic Performance
                                </Typography>
                                <Typography variant="caption" color="text.secondary">Last 30 Days</Typography>
                            </Box>

                            <Box sx={{ width: '100%', height: 400 }}>
                                {chartData.length > 0 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <AreaChart data={chartData}>
                                            <defs>
                                                <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                                    <stop offset="5%" stopColor={theme.palette.primary.main} stopOpacity={0.1} />
                                                    <stop offset="95%" stopColor={theme.palette.primary.main} stopOpacity={0} />
                                                </linearGradient>
                                            </defs>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme.palette.divider} />
                                            <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                            <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: theme.palette.text.secondary }} />
                                            <Tooltip
                                                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                                            />
                                            <Area type="monotone" dataKey="views" stroke={theme.palette.primary.main} strokeWidth={3} fillOpacity={1} fill="url(#colorViews)" />
                                        </AreaChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <Box height="100%" display="flex" alignItems="center" justifyContent="center">
                                        <Typography color="text.secondary">Insufficient data for visualization.</Typography>
                                    </Box>
                                )}
                            </Box>
                        </Paper>
                    </Grid>

                    {/* Right Column: Top Posts & Metrics */}
                    <Grid size={{ xs: 12, lg: 4 }}>
                        <Stack spacing={3}>
                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200' }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom>Top Content</Typography>
                                <Divider sx={{ mb: 3 }} />

                                {metrics?.topPosts?.length > 0 ? (
                                    <Stack spacing={3}>
                                        {metrics.topPosts.slice(0, 5).map((post: any) => (
                                            <Box key={post.id}>
                                                <Box display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                                                    <Typography variant="body2" fontWeight={600} noWrap sx={{ maxWidth: '70%', textDecoration: 'none', color: 'inherit', '&:hover': { color: 'primary.main' } }} component={Link} to={`/posts/${post.id}`}>
                                                        {post.title}
                                                    </Typography>
                                                    <Typography variant="caption" fontWeight={700}>{post.views} views</Typography>
                                                </Box>
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={metrics.totalViews > 0 ? (post.views / metrics.totalViews) * 100 : 0}
                                                    sx={{ height: 6, borderRadius: 3, bgcolor: 'grey.100' }}
                                                />
                                            </Box>
                                        ))}
                                    </Stack>
                                ) : (
                                    <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>No data yet.</Typography>
                                )}
                            </Paper>

                            <Paper elevation={0} sx={{ p: 4, borderRadius: 4, border: '1px solid', borderColor: 'grey.200', bgcolor: 'primary.50' }}>
                                <Typography variant="h6" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                                    <CommentsIcon fontSize="small" /> Engagement
                                </Typography>
                                <Typography variant="h4" fontWeight={800} color="primary" sx={{ my: 1 }}>{metrics?.totalComments || 0}</Typography>
                                <Typography variant="body2" color="text.secondary">Total comments across all posts.</Typography>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="primary.dark" fontWeight={600}>
                                    {metrics?.totalComments > 0 ? "You're building a community!" : "Write more engaging content!"}
                                </Typography>
                            </Paper>
                        </Stack>
                    </Grid>
                </Grid>
            </Container>
        </Box>
    );
};

// Quick fix: the above uses AreaChart but imports were missing some parts.
// import { AreaChart, Area } from 'recharts';

export default AnalyticsDashboard;
