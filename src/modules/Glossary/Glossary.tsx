import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { glossaryApi, GlossaryTerm } from '../../api/glossary.api';
import './Glossary.scss';

const Glossary: React.FC = () => {
  const { t, i18n } = useTranslation();
  const currentLanguage = i18n.language;

  // State
  const [terms, setTerms] = useState<GlossaryTerm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedLetter, setSelectedLetter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTerms, setExpandedTerms] = useState<Set<number>>(new Set());

  // Get alphabet based on current language
  const alphabet = useMemo(() => {
    if (currentLanguage === 'ru') {
      return 'АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ'.split('');
    }
    return 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  }, [currentLanguage]);

  // Load initial data
  useEffect(() => {
    loadTerms();
  }, [currentLanguage]);

  const loadTerms = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await glossaryApi.listTerms({
        per_page: 1000, // Load all terms
        language: currentLanguage
      });
      setTerms(response.data.items || []);
    } catch (err) {
      console.error('Error loading terms:', err);
      setError(t('glossary.error.loadTerms'));
    } finally {
      setLoading(false);
    }
  };

  // Get translation for current language
  const getTranslation = (term: GlossaryTerm) => {
    const translation = term.translations?.find(t => t.language === currentLanguage);
    if (translation) return translation;
    const englishTranslation = term.translations?.find(t => t.language === 'en');
    if (englishTranslation) return englishTranslation;
    return term.translations?.[0];
  };

  // Filter and sort terms
  const filteredTerms = useMemo(() => {
    let filtered = [...terms];

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(term => {
        const translation = getTranslation(term);
        const title = translation?.title || '';
        const description = translation?.description || '';
        return title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               description.toLowerCase().includes(searchQuery.toLowerCase());
      });
    }

    // Filter by letter
    if (selectedLetter) {
      filtered = filtered.filter(term => {
        const translation = getTranslation(term);
        const title = translation?.title || '';
        return title.toUpperCase().startsWith(selectedLetter);
      });
    }

    // Sort alphabetically
    filtered.sort((a, b) => {
      const aTitle = getTranslation(a)?.title || '';
      const bTitle = getTranslation(b)?.title || '';
      return aTitle.localeCompare(bTitle, currentLanguage);
    });

    return filtered;
  }, [terms, searchQuery, selectedLetter, currentLanguage]);

  // Get letters that have terms
  const availableLetters = useMemo(() => {
    const letters = new Set<string>();
    terms.forEach(term => {
      const translation = getTranslation(term);
      const title = translation?.title || '';
      if (title) {
        letters.add(title[0].toUpperCase());
      }
    });
    return letters;
  }, [terms, currentLanguage]);

  const toggleTerm = (termId: number) => {
    setExpandedTerms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(termId)) {
        newSet.delete(termId);
      } else {
        newSet.add(termId);
      }
      return newSet;
    });
  };

  return (
    <div className="glossary">
      <div className="glossary__container">
        {/* Header */}
        <div className="glossary__header">
          <h1>{t('glossary.title')}</h1>
          <p>{t('glossary.description')}</p>
        </div>

        {/* Search */}
        <div className="glossary__controls">
          <div className="glossary__search">
            <input
              type="text"
              placeholder={t('glossary.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="glossary__search-input"
            />
          </div>
        </div>

        <div className="glossary__content">
          {/* Alphabet Navigation */}
          <div className="glossary__alphabet">
            <button
              className={`glossary__letter ${!selectedLetter ? 'active' : ''}`}
              onClick={() => setSelectedLetter('')}
            >
              {t('glossary.all')}
            </button>
            {alphabet.map(letter => (
              <button
                key={letter}
                className={`glossary__letter ${selectedLetter === letter ? 'active' : ''} ${!availableLetters.has(letter) ? 'disabled' : ''}`}
                onClick={() => availableLetters.has(letter) && setSelectedLetter(letter)}
                disabled={!availableLetters.has(letter)}
              >
                {letter}
              </button>
            ))}
          </div>

          {/* Terms List */}
          <div className="glossary__main">
            {loading && (
              <div className="glossary__loading">
                {t('common.loading')}
              </div>
            )}

            {error && (
              <div className="glossary__error">
                {error}
              </div>
            )}

            {!loading && !error && filteredTerms.length === 0 && (
              <div className="glossary__empty">
                {t('glossary.noTerms')}
              </div>
            )}

            {!loading && !error && filteredTerms.length > 0 && (
              <div className="glossary__terms">
                {filteredTerms.map(term => {
                  const translation = getTranslation(term);
                  const isExpanded = expandedTerms.has(term.id);
                  
                  return (
                    <div
                      key={term.id}
                      className={`glossary__term ${isExpanded ? 'expanded' : ''}`}
                    >
                      <div
                        className="glossary__term-header"
                        onClick={() => toggleTerm(term.id)}
                      >
                        <h3 className="glossary__term-title">
                          {translation?.title || ''}
                        </h3>
                        <span className="glossary__term-arrow">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      </div>
                      
                      <div className="glossary__term-description">
                        {translation?.description}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Glossary;