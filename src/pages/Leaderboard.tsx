import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton,
  CircularProgress,
  Chip,
  Collapse,
  Stack,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { useI18n } from '../i18n/I18nProvider';
import { leaderboardService } from '../services/api';
import { useOrganization } from '../contexts/OrganizationContext';

interface SportPosition {
  id: string;
  abbreviation: string;
  name: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  playerName: string;
  position: string;
  ageCategory?: string;
  role?: string;
  totalPoints: number;
  workoutDays: number;
  // Legacy fields (may be undefined in new API)
  targetPoints?: number;
  compliancePct?: number;
  attendancePct?: number;
  freeSharePct?: number;
  teamTrainingDays?: number;
  coachWorkoutDays?: number;
  personalWorkoutDays?: number;
  lastUpdated?: string;
}

interface LeaderboardResponse {
  month: string;
  leaderboard: LeaderboardEntry[];
  currentCategory: string | null;
  availableCategories: string[];
}

export const Leaderboard: React.FC = () => {
  const { t } = useI18n();
  const { organization } = useOrganization();

  const [positionFilter, setPositionFilter] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [sportPositions, setSportPositions] = useState<SportPosition[]>([]);
  const [availableMonths, setAvailableMonths] = useState<string[]>([]);
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showPointsInfo, setShowPointsInfo] = useState(false);

  // Fetch sport positions from organization
  useEffect(() => {
    const fetchSportPositions = async () => {
      const token = localStorage.getItem('teamtrainer_token');
      if (!token) return;

      let orgId = organization?.id;
      if (!orgId) {
        try {
          const base64Url = token.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(atob(base64).split('').map(c =>
            '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)
          ).join(''));
          const payload = JSON.parse(jsonPayload);
          orgId = payload.organizationId;
        } catch (e) {
          console.error('[LEADERBOARD] Failed to decode token:', e);
        }
      }

      if (!orgId) return;

      try {
        const response = await fetch(`/api/organizations/${orgId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.ok) {
          const orgData = await response.json();
          if (orgData.sport?.positions && Array.isArray(orgData.sport.positions)) {
            setSportPositions(orgData.sport.positions);
            console.log('[LEADERBOARD] Loaded sport positions:', orgData.sport.positions.map((p: SportPosition) => p.abbreviation));
          }
        }
      } catch (error) {
        console.error('[LEADERBOARD] Error fetching sport positions:', error);
      }
    };

    fetchSportPositions();
  }, [organization]);

  // Generate available months (current month and 11 previous months)
  useEffect(() => {
    const months: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      months.push(monthStr);
    }
    setAvailableMonths(months);

    // Set current month as default
    if (!selectedMonth) {
      setSelectedMonth(months[0]);
    }
  }, []);

  useEffect(() => {
    const loadLeaderboard = async () => {
      if (!selectedMonth) return; // Wait for month to be set

      try {
        setLoading(true);

        // Determine which API endpoint to use
        let response: LeaderboardResponse;

        // Check if selectedMonth is current month
        const now = new Date();
        const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        if (selectedMonth === currentMonthStr) {
          // Use current week endpoint for current month
          response = await leaderboardService.getCurrentWeek(
            selectedCategory || undefined
          ) as LeaderboardResponse;
        } else {
          // Use month endpoint for historical months
          response = await leaderboardService.getMonth(
            selectedMonth,
            selectedCategory || undefined
          ) as LeaderboardResponse;
        }

        // Update available categories from server
        if (response.availableCategories) {
          setAvailableCategories(response.availableCategories);
          // Set selected category if not already set
          if (!selectedCategory && response.currentCategory) {
            setSelectedCategory(response.currentCategory);
          }
        }

        // Filter by position locally
        let filtered = response.leaderboard || [];
        if (positionFilter) {
          filtered = filtered.filter((entry: LeaderboardEntry) => entry.position === positionFilter);
        }

        setData(filtered);
      } catch (error) {
        console.error('[LEADERBOARD] Failed to load:', error);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    loadLeaderboard();
  }, [selectedCategory, positionFilter, selectedMonth]);

  // Format month for display (YYYY-MM -> Month YYYY)
  const formatMonth = (monthStr: string) => {
    if (!monthStr) return '';
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
  };

  return (
    <Box>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {t('leaderboard.title')}
      </Typography>

      {selectedMonth && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {formatMonth(selectedMonth)}
        </Typography>
      )}

      {/* Points Info Collapsible Section */}
      <Paper sx={{ mb: 3, overflow: 'hidden' }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            p: 2,
            cursor: 'pointer',
            '&:hover': { backgroundColor: 'action.hover' },
          }}
          onClick={() => setShowPointsInfo(!showPointsInfo)}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <InfoOutlinedIcon color="primary" />
            <Typography variant="subtitle1" fontWeight={600}>
              {t('leaderboard.howPointsCalculated')}
            </Typography>
          </Box>
          {showPointsInfo ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </Box>
        <Collapse in={showPointsInfo}>
          <Box sx={{ px: 2, pb: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {t('leaderboard.pointsExplanation')}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              <Chip
                label={t('leaderboard.lightWorkout')}
                sx={{ backgroundColor: '#2196F3', color: 'white', fontWeight: 600 }}
              />
              <Chip
                label={t('leaderboard.moderateWorkout')}
                sx={{ backgroundColor: '#ffa726', color: 'white', fontWeight: 600 }}
              />
              <Chip
                label={t('leaderboard.teamWorkout')}
                sx={{ backgroundColor: '#9c27b0', color: 'white', fontWeight: 600 }}
              />
              <Chip
                label={t('leaderboard.intensiveWorkout')}
                sx={{ backgroundColor: '#ef5350', color: 'white', fontWeight: 600 }}
              />
            </Stack>
          </Box>
        </Collapse>
      </Paper>

      {/* Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        {/* Month Selector */}
        {availableMonths.length > 0 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('leaderboard.selectMonth')}</InputLabel>
            <Select
              value={selectedMonth}
              label={t('leaderboard.selectMonth')}
              onChange={(e) => setSelectedMonth(e.target.value)}
            >
              {availableMonths.map((month) => (
                <MenuItem key={month} value={month}>
                  {formatMonth(month)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Category Filter - always show if coach has categories */}
        {availableCategories.length > 0 && (
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel>{t('leaderboard.filterByCategory')}</InputLabel>
            <Select
              value={selectedCategory}
              label={t('leaderboard.filterByCategory')}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {availableCategories.map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}

        {/* Position Filter */}
        {sportPositions.length > 0 && (
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>{t('leaderboard.filterByPosition')}</InputLabel>
            <Select
              value={positionFilter}
              label={t('leaderboard.filterByPosition')}
              onChange={(e) => setPositionFilter(e.target.value)}
            >
              <MenuItem value="">
                <em>{t('leaderboard.allPositions')}</em>
              </MenuItem>
              {sportPositions.map((pos) => (
                <MenuItem key={pos.id} value={pos.abbreviation}>
                  {pos.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: { xs: 300, sm: 650 } }}>
          <TableHead>
            <TableRow sx={{ backgroundColor: 'primary.main' }}>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {t('leaderboard.rank')}
                  <Tooltip title={t('leaderboard.rankInfo')} arrow>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                {t('leaderboard.player')}
              </TableCell>
              <TableCell sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  {t('leaderboard.pos')}
                  <Tooltip title={t('leaderboard.posInfo')} arrow>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  {t('leaderboard.score')}
                  <Tooltip title={t('leaderboard.scoreInfo')} arrow>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              <TableCell align="right" sx={{ color: 'white', fontWeight: 600 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                  {t('leaderboard.workoutDays')}
                  <Tooltip title={t('leaderboard.workoutDaysInfo')} arrow>
                    <IconButton size="small" sx={{ color: 'white', p: 0 }}>
                      <InfoOutlinedIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <Typography color="text.secondary">
                    {t('leaderboard.noData')}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => (
                <TableRow
                  key={row.userId}
                  sx={{
                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' },
                    '&:last-child td, &:last-child th': { border: 0 },
                  }}
                >
                  <TableCell component="th" scope="row" sx={{ fontWeight: row.rank <= 3 ? 700 : 600 }}>
                    #{row.rank}
                  </TableCell>
                  <TableCell sx={{ fontWeight: row.rank <= 3 ? 600 : 400 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {row.playerName}
                      {row.role === 'coach' && (
                        <Chip
                          label={t('leaderboard.coach')}
                          size="small"
                          color="secondary"
                          sx={{ height: 20, fontSize: '0.7rem' }}
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell align="right" sx={{ fontWeight: row.rank <= 3 ? 600 : 400 }}>
                    {row.totalPoints.toFixed(1)}
                  </TableCell>
                  <TableCell align="right">{row.workoutDays}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};
