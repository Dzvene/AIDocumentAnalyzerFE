import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  TextField,
  InputAdornment,
  IconButton,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Pagination,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
  Tooltip,
  Paper
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Category as CategoryIcon,
  Info as InfoIcon,
  TrendingUp as TrendingUpIcon,
  Language as LanguageIcon,
  ExpandMore as ExpandMoreIcon,
  Book as BookIcon,
  Label as LabelIcon,
  Link as LinkIcon,
  History as HistoryIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { glossaryApi, GlossaryTerm, GlossaryCategory, GlossaryStats } from '../../api/glossary.api';
import './Glossary.scss';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index, ...other }) => {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`glossary-tabpanel-${index}`}
      aria-labelledby={`glossary-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

const Glossary: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // State
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [categories, setCategories] = useState<GlossaryCategory[]>([]);
  const [stats, setStats] = useState<GlossaryStats | null>(null);
  const [selectedTerm, setSelectedTerm] = useState<GlossaryTerm | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Load initial data
  useEffect(() => {
    loadCategories();
    loadTerms();
    loadStats();
  }, []);

  // Load categories
  const loadCategories = async () => {
    try {
      const response = await glossaryApi.listCategories();
      setCategories(response.items);
    } catch (err) {
      console.error('Error loading categories:', err);
    }
  };

  // Load terms
  const loadTerms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await glossaryApi.listTerms({
        page,
        per_page: 12,
        category: selectedCategory || undefined,
        search: searchQuery || undefined,
        language: currentLanguage
      });
      setTerms(response.items);
      setTotalPages(response.pages);
    } catch (err) {
      console.error('Error loading terms:', err);
      setError(t('glossary.error.loadTerms'));
    } finally {
      setLoading(false);
    }
  }, [page, selectedCategory, searchQuery, currentLanguage, t]);

  // Load stats
  const loadStats = async () => {
    try {
      const response = await glossaryApi.getStats();
      setStats(response);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  // Search terms
  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      loadTerms();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const response = await glossaryApi.searchTerms({
        query: searchQuery,
        language: currentLanguage,
        category: selectedCategory || undefined,
        limit: 20
      });
      setTerms(response.results);
      setTotalPages(1); // Search doesn't use pagination
    } catch (err) {
      console.error('Error searching terms:', err);
      setError(t('glossary.error.search'));
    } finally {
      setLoading(false);
    }
  };

  // Handle term click
  const handleTermClick = async (term: GlossaryTerm) => {
    try {
      // Fetch full term details
      const fullTerm = await glossaryApi.getTerm(term.id);
      setSelectedTerm(fullTerm);
      setDetailDialogOpen(true);
    } catch (err) {
      console.error('Error loading term details:', err);
      setError(t('glossary.error.loadTermDetail'));
    }
  };

  // Get translation for current language
  const getTranslation = (term: GlossaryTerm) => {
    const translation = term.translations.find(t => t.language === currentLanguage);
    if (translation) return translation;
    // Fallback to English
    const englishTranslation = term.translations.find(t => t.language === 'en');
    if (englishTranslation) return englishTranslation;
    // Fallback to first available translation
    return term.translations[0];
  };

  // Get category translation
  const getCategoryTranslation = (category: GlossaryCategory) => {
    const translation = category.translations.find(t => t.language === currentLanguage);
    if (translation) return translation;
    const englishTranslation = category.translations.find(t => t.language === 'en');
    if (englishTranslation) return englishTranslation;
    return category.translations[0];
  };

  // Effects
  useEffect(() => {
    loadTerms();
  }, [loadTerms]);

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Container maxWidth="xl" className="glossary-container">
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          <BookIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          {t('glossary.title', 'Glossary')}
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {t('glossary.description', 'Browse and search technical terms and definitions')}
        </Typography>
      </Box>

      {/* Search and Filter Bar */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={t('glossary.searchPlaceholder', 'Search terms...')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchQuery && (
                  <InputAdornment position="end">
                    <IconButton onClick={() => {
                      setSearchQuery('');
                      loadTerms();
                    }}>
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>{t('glossary.category', 'Category')}</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value as string);
                  setPage(1);
                }}
                label={t('glossary.category', 'Category')}
                startAdornment={<CategoryIcon sx={{ mr: 1, color: 'action.active' }} />}
              >
                <MenuItem value="">
                  <em>{t('glossary.allCategories', 'All Categories')}</em>
                </MenuItem>
                {categories.map((category) => {
                  const translation = getCategoryTranslation(category);
                  return (
                    <MenuItem key={category.id} value={category.slug}>
                      {translation?.name}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Button
              fullWidth
              variant="contained"
              onClick={handleSearch}
              startIcon={<SearchIcon />}
              sx={{ height: 56 }}
            >
              {t('glossary.search', 'Search')}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistics Summary */}
      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {t('glossary.stats.totalTerms', 'Total Terms')}
                </Typography>
                <Typography variant="h4">
                  {stats.total_terms}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {t('glossary.stats.categories', 'Categories')}
                </Typography>
                <Typography variant="h4">
                  {stats.total_categories}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {t('glossary.stats.searches', 'Total Searches')}
                </Typography>
                <Typography variant="h4">
                  {stats.total_searches}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="text.secondary" gutterBottom>
                  {t('glossary.stats.popularTerm', 'Most Popular')}
                </Typography>
                <Typography variant="h5">
                  {stats.popular_terms[0]?.slug || 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label={t('glossary.tabs.all', 'All Terms')} icon={<BookIcon />} iconPosition="start" />
          <Tab label={t('glossary.tabs.popular', 'Popular')} icon={<TrendingUpIcon />} iconPosition="start" />
          <Tab label={t('glossary.tabs.recent', 'Recent Searches')} icon={<HistoryIcon />} iconPosition="start" />
        </Tabs>
      </Box>

      {/* Loading and Error States */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Tab Panels */}
      <TabPanel value={tabValue} index={0}>
        {/* Terms Grid */}
        {!loading && terms.length > 0 && (
          <>
            <Grid container spacing={3}>
              {terms.map((term) => {
                const translation = getTranslation(term);
                return (
                  <Grid item xs={12} sm={6} md={4} key={term.id}>
                    <Card 
                      className="term-card"
                      sx={{ 
                        height: '100%',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        '&:hover': {
                          transform: 'translateY(-4px)',
                          boxShadow: 3
                        }
                      }}
                      onClick={() => handleTermClick(term)}
                    >
                      <CardContent>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="h6" component="h2">
                            {translation?.title}
                          </Typography>
                          <Tooltip title={t('glossary.views', 'Views')}>
                            <Badge badgeContent={term.view_count} color="primary">
                              <VisibilityIcon fontSize="small" />
                            </Badge>
                          </Tooltip>
                        </Box>
                        
                        {term.category && (
                          <Chip
                            label={term.category}
                            size="small"
                            icon={<CategoryIcon />}
                            sx={{ mb: 1 }}
                          />
                        )}
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {translation?.short_description}
                        </Typography>
                        
                        {translation?.abbreviations && (
                          <Box sx={{ mt: 1 }}>
                            <Chip
                              label={translation.abbreviations}
                              size="small"
                              variant="outlined"
                              icon={<LabelIcon />}
                            />
                          </Box>
                        )}
                      </CardContent>
                      <CardActions>
                        <Button 
                          size="small" 
                          startIcon={<InfoIcon />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleTermClick(term);
                          }}
                        >
                          {t('glossary.viewDetails', 'View Details')}
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>

            {/* Pagination */}
            {totalPages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                  size="large"
                />
              </Box>
            )}
          </>
        )}

        {/* Empty State */}
        {!loading && terms.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <BookIcon sx={{ fontSize: 64, color: 'text.disabled', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              {t('glossary.noTerms', 'No terms found')}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {t('glossary.tryDifferentSearch', 'Try a different search or category')}
            </Typography>
          </Box>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Popular Terms */}
        {stats && stats.popular_terms.length > 0 && (
          <List>
            {stats.popular_terms.map((popularTerm, index) => (
              <React.Fragment key={popularTerm.slug}>
                <ListItem>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mr: 2 }}>
                          #{index + 1}
                        </Typography>
                        <Typography variant="body1">
                          {popularTerm.slug}
                        </Typography>
                      </Box>
                    }
                    secondary={`${popularTerm.views} ${t('glossary.views', 'views')}`}
                  />
                </ListItem>
                {index < stats.popular_terms.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Recent Searches */}
        {stats && stats.recent_searches.length > 0 && (
          <List>
            {stats.recent_searches.map((search, index) => (
              <React.Fragment key={`${search.term}-${search.date}`}>
                <ListItem>
                  <ListItemText
                    primary={search.term}
                    secondary={
                      <Box>
                        <Chip
                          label={`${search.results} ${t('glossary.results', 'results')}`}
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Chip
                          label={search.language.toUpperCase()}
                          size="small"
                          icon={<LanguageIcon />}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="caption" component="span">
                          {new Date(search.date).toLocaleDateString()}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < stats.recent_searches.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        )}
      </TabPanel>

      {/* Term Detail Dialog */}
      <Dialog
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedTerm && (() => {
          const translation = getTranslation(selectedTerm);
          return (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Typography variant="h5">
                    {translation?.title}
                  </Typography>
                  <IconButton onClick={() => setDetailDialogOpen(false)}>
                    <ClearIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent dividers>
                {selectedTerm.category && (
                  <Chip
                    label={selectedTerm.category}
                    icon={<CategoryIcon />}
                    sx={{ mb: 2 }}
                  />
                )}

                <Typography variant="h6" gutterBottom>
                  {t('glossary.shortDescription', 'Short Description')}
                </Typography>
                <Typography paragraph>
                  {translation?.short_description}
                </Typography>

                <Typography variant="h6" gutterBottom>
                  {t('glossary.fullDescription', 'Full Description')}
                </Typography>
                <Typography paragraph>
                  {translation?.full_description}
                </Typography>

                {translation?.usage_examples && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('glossary.usageExamples', 'Usage Examples')}
                    </Typography>
                    <Typography paragraph>
                      {translation.usage_examples}
                    </Typography>
                  </>
                )}

                {translation?.synonyms && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('glossary.synonyms', 'Synonyms')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {translation.synonyms.split(',').map((synonym, idx) => (
                        <Chip
                          key={idx}
                          label={synonym.trim()}
                          sx={{ mr: 1, mb: 1 }}
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </>
                )}

                {translation?.abbreviations && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('glossary.abbreviations', 'Abbreviations')}
                    </Typography>
                    <Box sx={{ mb: 2 }}>
                      {translation.abbreviations.split(',').map((abbr, idx) => (
                        <Chip
                          key={idx}
                          label={abbr.trim()}
                          sx={{ mr: 1, mb: 1 }}
                          color="primary"
                        />
                      ))}
                    </Box>
                  </>
                )}

                {selectedTerm.related_terms && selectedTerm.related_terms.length > 0 && (
                  <>
                    <Typography variant="h6" gutterBottom>
                      {t('glossary.relatedTerms', 'Related Terms')}
                    </Typography>
                    <Box>
                      {selectedTerm.related_terms.map((related, idx) => (
                        <Chip
                          key={idx}
                          label={related.slug}
                          sx={{ mr: 1, mb: 1 }}
                          icon={<LinkIcon />}
                          clickable
                        />
                      ))}
                    </Box>
                  </>
                )}

                <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                  <Typography variant="caption" color="text.secondary">
                    {t('glossary.views', 'Views')}: {selectedTerm.view_count} | 
                    {' '}{t('glossary.lastUpdated', 'Last updated')}: {new Date(selectedTerm.updated_at).toLocaleDateString()}
                  </Typography>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDetailDialogOpen(false)}>
                  {t('glossary.close', 'Close')}
                </Button>
              </DialogActions>
            </>
          );
        })()}
      </Dialog>
    </Container>
  );
};

export default Glossary;