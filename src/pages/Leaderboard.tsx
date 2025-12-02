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
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { useI18n } from '../i18n/I18nProvider';
import { leaderboardService } from '../services/api';
import type { Position } from '../types/exercise';

const positions: Position[] = ['RB', 'WR', 'LB', 'OL', 'DB', 'QB', 'DL', 'TE', 'K/P'];

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

  const [positionFilter, setPositionFilter] = useState<Position | ''>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [availableCategories, setAvailableCategories] = useState<string[]>([]);
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState<string>('');

  useEffect(() => {
    const loadLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await leaderboardService.getCurrentWeek(
          selectedCategory || undefined
        ) as LeaderboardResponse;

        // Update available categories from server
        if (response.availableCategories) {
          setAvailableCategories(response.availableCategories);
          // Set selected category if not already set
          if (!selectedCategory && response.currentCategory) {
            setSelectedCategory(response.currentCategory);
          }
        }

        setCurrentMonth(response.month || '');

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
  }, [selectedCategory, positionFilter]);

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

      {currentMonth && (
        <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
          {formatMonth(currentMonth)}
        </Typography>
      )}

      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>{t('leaderboard.filterByPosition')}</InputLabel>
          <Select
            value={positionFilter}
            label={t('leaderboard.filterByPosition')}
            onChange={(e) => setPositionFilter(e.target.value as Position | '')}
          >
            <MenuItem value="">
              <em>{t('leaderboard.allPositions')}</em>
            </MenuItem>
            {positions.map((pos) => (
              <MenuItem key={pos} value={pos}>
                {t(`position.${pos}` as any)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Category Filter - only show if coach has multiple categories */}
        {availableCategories.length > 1 && (
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
