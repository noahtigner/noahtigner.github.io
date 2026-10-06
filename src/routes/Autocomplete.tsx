import { useEffect, useState } from 'react';
import { Autocomplete } from '@base-ui/react/autocomplete';
import { Checkbox } from '@base-ui/react/checkbox';
import { useQuery } from '@tanstack/react-query';
import styled from '@emotion/styled';

import MetaTags from '~/components/MetaTags';
import Divider from '~/components/Divider';
import { Button, ButtonLink, LinkInternal } from '~/components/Button';
import { Card } from '~/components/Card';
import { paths } from '~/routes';

const SEARCH_URL = 'https://autocomplete.noahtigner.com/search';
const SEARCH_DELAY_MS = 200;
const EMPTY_MOVIES: Movie[] = [];
const numberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 1,
});

const genres = [
  { value: 'action', label: 'Action' },
  { value: 'adult', label: 'Adult' },
  { value: 'adventure', label: 'Adventure' },
  { value: 'animation', label: 'Animation' },
  { value: 'biography', label: 'Biography' },
  { value: 'comedy', label: 'Comedy' },
  { value: 'crime', label: 'Crime' },
  { value: 'documentary', label: 'Documentary' },
  { value: 'drama', label: 'Drama' },
  { value: 'family', label: 'Family' },
  { value: 'fantasy', label: 'Fantasy' },
  { value: 'film-noir', label: 'Film-Noir' },
  { value: 'game-show', label: 'Game Show' },
  { value: 'history', label: 'History' },
  { value: 'horror', label: 'Horror' },
  { value: 'music', label: 'Music' },
  { value: 'musical', label: 'Musical' },
  { value: 'mystery', label: 'Mystery' },
  { value: 'news', label: 'News' },
  { value: 'reality-tv', label: 'Reality TV' },
  { value: 'romance', label: 'Romance' },
  { value: 'sci-fi', label: 'Sci-Fi' },
  { value: 'short', label: 'Short' },
  { value: 'sport', label: 'Sport' },
  { value: 'talk-show', label: 'Talk Show' },
  { value: 'thriller', label: 'Thriller' },
  { value: 'war', label: 'War' },
  { value: 'western', label: 'Western' },
] as const;

const titleTypes = [
  { value: 'movie', label: 'Movie' },
  { value: 'short', label: 'Short' },
  { value: 'tvepisode', label: 'TV Episode' },
  { value: 'tvminiseries', label: 'TV Miniseries' },
  { value: 'tvmovie', label: 'TV Movie' },
  { value: 'tvpilot', label: 'TV Pilot' },
  { value: 'tvseries', label: 'TV Series' },
  { value: 'tvshort', label: 'TV Short' },
  { value: 'tvspecial', label: 'TV Special' },
  { value: 'video', label: 'Video' },
  { value: 'videogame', label: 'Video Game' },
] as const;

type Movie = {
  id: number;
  primaryTitle: string;
  originalTitle: string;
  year: number | null;
  runtimeMinutes: number | null;
  averageRating: number | null;
  numVotes: number;
};

type SearchResponse = {
  Total: number;
  Movies: Movie[];
};

const PageContainer = styled.div`
  width: 100%;
  max-width: var(--size-md);
  margin-inline: auto;
`;

const Intro = styled.p`
  max-width: 44rem;
  margin-top: 1.5rem;
  color: var(--color-text-secondary);
`;

const Metrics = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1px;
  margin: 1.5rem 0 2rem;
  border: 1px solid var(--color-border-card);
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--color-border-card);

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const Metric = styled.div`
  padding: 1rem;
  background-color: var(--color-paper);
`;

const MetricValue = styled.dd`
  margin: 0;
  color: var(--color-text-primary);
  font-size: 1.25rem;
  font-weight: 400;
`;

const MetricLabel = styled.dt`
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const SearchSection = styled.section`
  margin-top: 2rem;
`;

const SearchLabel = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--color-text-primary);
  font-size: 0.875rem;
`;

const SearchHint = styled.p`
  margin-bottom: 0.5rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const FilterControls = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: end;
  gap: 0.75rem;
  margin: 1rem 0;
`;

const LimitField = styled.label`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const LimitInput = styled.input`
  box-sizing: border-box;
  width: 7rem;
  height: 2rem;
  padding: 0.25rem 0.5rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-paper);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 0.875rem;
  outline: 0;

  &:focus-visible {
    border-color: var(--color-focus);
    box-shadow: 0 0 0 1px var(--color-focus);
  }
`;

const LimitHelp = styled.p`
  flex-basis: 100%;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const LimitError = styled(LimitHelp)`
  color: #f09b9b;
`;

const ClearFilters = styled(Button)`
  height: 2rem;
  cursor: pointer;

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

const FilterDetails = styled.details`
  margin-top: 0.5rem;
  border: 1px solid var(--color-border-card);
  border-radius: var(--border-radius);
  background-color: var(--color-paper);

  &[open] > summary::after {
    content: '-';
  }
`;

const FilterSummary = styled.summary`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.625rem 0.75rem;
  color: var(--color-text-primary);
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  &::after {
    content: '+';
    color: var(--color-text-secondary);
    font-size: 1.125rem;
    line-height: 1;
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }
`;

const FilterSelectionCount = styled.span`
  margin-left: auto;
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(9rem, 1fr));
  gap: 0.25rem;
  padding: 0.25rem 0.75rem 0.75rem;

  @media (max-width: 600px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
`;

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 0;
  padding: 0.375rem;
  border-radius: var(--border-radius);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
  cursor: pointer;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
      color: var(--color-text-primary);
    }
  }
`;

const FilterCheckbox = styled(Checkbox.Root)`
  display: flex;
  flex-shrink: 0;
  align-items: center;
  justify-content: center;
  width: 1rem;
  height: 1rem;
  border: 1px solid var(--color-border-dark);
  border-radius: 3px;
  color: var(--color-black);
  outline: 0;

  &[data-checked] {
    border-color: var(--color-focus);
    background-color: var(--color-focus);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: 2px;
  }
`;

const FilterCheckboxIndicator = styled(Checkbox.Indicator)`
  font-size: 0.75rem;
  line-height: 1;
`;

const SearchInput = styled(Autocomplete.Input)`
  box-sizing: border-box;
  width: 100%;
  margin-top: 1rem;
  padding: 0.75rem 0.875rem;
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius);
  background-color: var(--color-paper);
  color: var(--color-text-primary);
  font: inherit;
  font-size: 1rem;
  outline: 0;

  &::placeholder {
    color: var(--color-text-secondary);
  }

  &:hover {
    border-color: var(--color-border-dark);
  }

  &:focus-visible {
    border-color: var(--color-focus);
    box-shadow: 0 0 0 1px var(--color-focus);
  }
`;

const SearchPositioner = styled(Autocomplete.Positioner)`
  z-index: 20;
  width: min(var(--anchor-width), calc(100vw - 2rem));
`;

const SearchPopup = styled(Autocomplete.Popup)`
  box-sizing: border-box;
  max-height: min(var(--available-height), 26rem);
  overflow-y: auto;
  border: 1px solid var(--color-border-dark);
  border-radius: var(--border-radius);
  background-color: var(--color-paper);
  box-shadow: 0 12px 28px rgba(0, 0, 0, 0.35);
  transform-origin: var(--transform-origin);
  transition:
    opacity 150ms ease,
    transform 150ms ease;

  &[data-starting-style],
  &[data-ending-style] {
    opacity: 0;
    transform: scale(0.98);
  }
`;

const ResultCount = styled.p`
  padding: 0.625rem 0.875rem;
  border-bottom: 1px solid var(--color-divider);
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const SearchStatus = styled(Autocomplete.Status)`
  padding: 0.75rem 0.875rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const SearchError = styled(SearchStatus)`
  color: #f09b9b;
`;

const MovieList = styled(Autocomplete.List)`
  display: flex;
  flex-direction: column;
  padding: 0.25rem;
`;

const MovieItem = styled(Autocomplete.Item)`
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.625rem;
  border-radius: var(--border-radius);
  color: var(--color-text-primary);
  cursor: pointer;
  outline: 0;

  @media (hover: hover) {
    &:hover {
      background-color: var(--color-gray-100);
    }
  }

  &[data-highlighted] {
    background-color: var(--color-gray-100);
  }

  &:focus-visible {
    outline: 2px solid var(--color-focus);
    outline-offset: -2px;
  }
`;

const MovieTitle = styled.span`
  overflow: hidden;
  font-size: 0.9375rem;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const MovieMetadata = styled.span`
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const MovieOriginalTitle = styled.span`
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const SelectedMovieCard = styled(Card)`
  margin-top: 1rem;
  gap: 0.75rem;
`;

const SelectedMovieLabel = styled.p`
  color: var(--color-text-secondary);
  font-size: 0.8125rem;
`;

const SelectedMovieTitle = styled.h2`
  margin-top: 0.25rem;
  font-size: 1.25rem;
  font-weight: 400;
`;

const SelectedMovieOriginalTitle = styled.p`
  margin-top: 0.25rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

const ImdbLink = styled(ButtonLink)`
  width: fit-content;
  cursor: pointer;
`;

const EmptyResults = styled(Autocomplete.Empty)`
  padding: 0.75rem 0.875rem;
  color: var(--color-text-secondary);
  font-size: 0.875rem;
`;

function getMovieMetadata(movie: Movie): string {
  const details = [
    movie.year?.toString(),
    movie.runtimeMinutes ? `${movie.runtimeMinutes} min` : null,
    movie.averageRating ? `${movie.averageRating.toFixed(1)} rating` : null,
    movie.numVotes ? `${numberFormatter.format(movie.numVotes)} votes` : null,
  ].filter(Boolean);

  return details.join(' · ');
}

function getImdbUrl(movie: Movie): string {
  return `https://www.imdb.com/title/tt${movie.id.toString().padStart(7, '0')}/`;
}

function useDebouncedValue(value: string, delay: number): string {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeout = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timeout);
  }, [value, delay]);

  return debouncedValue;
}

async function fetchMovies(
  searchTerm: string,
  limit: number | undefined,
  selectedGenres: readonly string[],
  selectedTitleTypes: readonly string[],
  signal: AbortSignal
): Promise<SearchResponse> {
  const url = new URL(SEARCH_URL);
  url.searchParams.set('q', searchTerm);
  if (limit !== undefined) {
    url.searchParams.set('limit', limit.toString());
  }
  for (const genre of selectedGenres) {
    url.searchParams.append('genre', genre);
  }
  for (const titleType of selectedTitleTypes) {
    url.searchParams.append('type', titleType);
  }

  const response = await fetch(url, { signal });
  if (!response.ok) {
    throw new Error(`Search request failed with ${response.status}`);
  }

  return (await response.json()) as SearchResponse;
}

function AutocompleteDemo() {
  const [query, setQuery] = useState('');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [limitInput, setLimitInput] = useState('');
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [selectedTitleTypes, setSelectedTitleTypes] = useState<string[]>([]);
  const searchTerm = query.trim();
  const debouncedSearchTerm = useDebouncedValue(searchTerm, SEARCH_DELAY_MS);
  const parsedLimit = Number(limitInput);
  const isLimitValid =
    limitInput === '' ||
    (Number.isInteger(parsedLimit) && parsedLimit >= 0 && parsedLimit <= 100);
  const limit = limitInput === '' ? undefined : parsedLimit;
  const isCurrentQuery = searchTerm === debouncedSearchTerm;
  const { data, isError, isFetching, isPending } = useQuery({
    queryKey: [
      'movie-search',
      debouncedSearchTerm,
      limit,
      selectedGenres,
      selectedTitleTypes,
    ] as const,
    queryFn: ({ queryKey, signal }) =>
      fetchMovies(queryKey[1], queryKey[2], queryKey[3], queryKey[4], signal),
    enabled: Boolean(debouncedSearchTerm) && isLimitValid,
    staleTime: 60_000,
    retry: false,
    refetchOnWindowFocus: false,
  });
  const isLoading =
    Boolean(searchTerm) &&
    isLimitValid &&
    (!isCurrentQuery || isPending || isFetching);
  const hasError = isCurrentQuery && isError;
  const visibleResults = isCurrentQuery && isLimitValid ? data : undefined;
  const movies = visibleResults?.Movies ?? EMPTY_MOVIES;
  const hasActiveFilters =
    limitInput !== '' ||
    selectedGenres.length > 0 ||
    selectedTitleTypes.length > 0;

  const clearFilters = () => {
    setLimitInput('');
    setSelectedGenres([]);
    setSelectedTitleTypes([]);
  };

  return (
    <>
      <Autocomplete.Root
        items={movies}
        value={query}
        onValueChange={(value, eventDetails) => {
          setQuery(value);
          if (eventDetails.reason !== 'item-press') {
            setSelectedMovie(null);
          }
        }}
        itemToStringValue={(movie) => movie.primaryTitle}
        mode="none"
        autoHighlight
        openOnInputClick
      >
        <SearchLabel htmlFor="movie-search">
          Search 12.7 million IMDb titles
        </SearchLabel>
        <SearchHint>
          Results are ranked by the live autocomplete engine as you type.
        </SearchHint>
        <FilterControls>
          <LimitField>
            Result limit
            <LimitInput
              type="number"
              min="0"
              max="100"
              step="1"
              value={limitInput}
              onChange={(event) => setLimitInput(event.target.value)}
              aria-describedby="result-limit-help"
              aria-invalid={!isLimitValid || undefined}
              placeholder="10"
            />
          </LimitField>
          <ClearFilters
            type="button"
            onClick={clearFilters}
            disabled={!hasActiveFilters}
          >
            Clear filters
          </ClearFilters>
          <LimitHelp id="result-limit-help">
            Default: 10. Set 0 to return only the match count.
          </LimitHelp>
        </FilterControls>
        {!isLimitValid ? (
          <LimitError>Enter a whole-number limit from 0 to 100.</LimitError>
        ) : null}
        <FilterDetails>
          <FilterSummary>
            Genres
            <FilterSelectionCount>
              {selectedGenres.length === 0
                ? 'Any genre'
                : `${selectedGenres.length} selected`}
            </FilterSelectionCount>
          </FilterSummary>
          <FilterGrid>
            {genres.map((genre) => {
              const checked = selectedGenres.includes(genre.value);
              return (
                <FilterOption key={genre.value}>
                  <FilterCheckbox
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      setSelectedGenres((currentGenres) =>
                        nextChecked
                          ? [...currentGenres, genre.value]
                          : currentGenres.filter(
                              (value) => value !== genre.value
                            )
                      )
                    }
                  >
                    <FilterCheckboxIndicator>✓</FilterCheckboxIndicator>
                  </FilterCheckbox>
                  {genre.label}
                </FilterOption>
              );
            })}
          </FilterGrid>
        </FilterDetails>
        <FilterDetails>
          <FilterSummary>
            Title types
            <FilterSelectionCount>
              {selectedTitleTypes.length === 0
                ? 'Any type'
                : `${selectedTitleTypes.length} selected`}
            </FilterSelectionCount>
          </FilterSummary>
          <FilterGrid>
            {titleTypes.map((titleType) => {
              const checked = selectedTitleTypes.includes(titleType.value);
              return (
                <FilterOption key={titleType.value}>
                  <FilterCheckbox
                    checked={checked}
                    onCheckedChange={(nextChecked) =>
                      setSelectedTitleTypes((currentTitleTypes) =>
                        nextChecked
                          ? [...currentTitleTypes, titleType.value]
                          : currentTitleTypes.filter(
                              (value) => value !== titleType.value
                            )
                      )
                    }
                  >
                    <FilterCheckboxIndicator>✓</FilterCheckboxIndicator>
                  </FilterCheckbox>
                  {titleType.label}
                </FilterOption>
              );
            })}
          </FilterGrid>
        </FilterDetails>
        <SearchInput
          id="movie-search"
          placeholder="Try Star Wars, The Matrix, or Parasite"
          autoComplete="off"
        />

        <Autocomplete.Portal>
          <SearchPositioner
            side="bottom"
            align="start"
            sideOffset={8}
            collisionPadding={{ top: 16, right: 16, bottom: 16, left: 16 }}
            collisionAvoidance={{ side: 'none' }}
          >
            <SearchPopup aria-label="Movie suggestions">
              {isLoading ? (
                <SearchStatus>Searching titles...</SearchStatus>
              ) : null}
              {hasError ? (
                <SearchError>Search is temporarily unavailable.</SearchError>
              ) : null}
              {visibleResults ? (
                <ResultCount>
                  {numberFormatter.format(visibleResults.Total)} matching titles
                </ResultCount>
              ) : null}
              {limit === 0 && visibleResults ? (
                <SearchStatus>
                  Increase the result limit to preview matching titles.
                </SearchStatus>
              ) : (
                <MovieList>
                  {movies.map((movie, index) => (
                    <MovieItem
                      key={movie.id}
                      value={movie}
                      index={index}
                      onClick={() => setSelectedMovie(movie)}
                    >
                      <MovieTitle>{movie.primaryTitle}</MovieTitle>
                      {movie.originalTitle !== movie.primaryTitle ? (
                        <MovieOriginalTitle>
                          {movie.originalTitle}
                        </MovieOriginalTitle>
                      ) : null}
                      <MovieMetadata>{getMovieMetadata(movie)}</MovieMetadata>
                    </MovieItem>
                  ))}
                </MovieList>
              )}
              {searchTerm &&
              visibleResults &&
              limit !== 0 &&
              !isLoading &&
              !hasError ? (
                <EmptyResults>No titles match that search.</EmptyResults>
              ) : null}
            </SearchPopup>
          </SearchPositioner>
        </Autocomplete.Portal>
      </Autocomplete.Root>
      {selectedMovie ? (
        <SelectedMovieCard>
          <div>
            <SelectedMovieLabel>Selected title</SelectedMovieLabel>
            <SelectedMovieTitle>
              {selectedMovie.primaryTitle}
            </SelectedMovieTitle>
            {selectedMovie.originalTitle !== selectedMovie.primaryTitle ? (
              <SelectedMovieOriginalTitle>
                {selectedMovie.originalTitle}
              </SelectedMovieOriginalTitle>
            ) : null}
            <SelectedMovieOriginalTitle>
              {getMovieMetadata(selectedMovie)}
            </SelectedMovieOriginalTitle>
          </div>
          <ImdbLink
            href={getImdbUrl(selectedMovie)}
            target="_blank"
            rel="noopener noreferrer"
          >
            View on IMDb
          </ImdbLink>
        </SelectedMovieCard>
      ) : null}
    </>
  );
}

export default function AutocompletePage() {
  return (
    <PageContainer>
      <MetaTags
        title="IMDb Autocomplete Engine - Noah Tigner"
        description="Try Noah Tigner's custom Go search engine for IMDb titles, built with in-memory inverted indexes and bounded top-K ranking."
      />
      <Divider asHeading={1}>IMDb Autocomplete Engine</Divider>
      <Intro>
        A custom in-memory search engine in Go for IMDb movie, TV, and video
        titles. It combines n-gram inverted indexes, candidate verification, and
        bounded top-K ranking to serve useful suggestions quickly.
      </Intro>
      <Metrics>
        <Metric>
          <MetricValue>12.7M</MetricValue>
          <MetricLabel>indexed IMDb titles</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue>49s</MetricValue>
          <MetricLabel>full index build</MetricLabel>
        </Metric>
        <Metric>
          <MetricValue>3.84 GiB</MetricValue>
          <MetricLabel>peak RSS</MetricLabel>
        </Metric>
      </Metrics>
      <SearchSection aria-label="Search the IMDb autocomplete engine">
        <AutocompleteDemo />
      </SearchSection>
      <LinkInternal
        to={paths.home}
        prefetch="intent"
        style={{
          width: 'fit-content',
          display: 'block',
          marginInline: 'auto',
          marginTop: '32px',
        }}
      >
        &lt; Back Home
      </LinkInternal>
    </PageContainer>
  );
}
