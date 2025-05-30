'use client';

import React, { useState, useEffect } from 'react';
import { Input, Spin } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useSearchParams, useRouter } from 'next/navigation';
import TypeSelector from './type';
import AreaSelector from './area';
import FilterSelector from './filter';
import ResultFood from './result';
import useSearch from '@/hooks/useSearch';
import SearchService from '@/services/search';

const { Search } = Input;

const Page: React.FC = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const queryFromUrl = searchParams?.get('q') || '';
    
    const { searchResults, loading, filters, search, updateFilters } = useSearch();
    const [searchKeyword, setSearchKeyword] = useState(queryFromUrl);
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [popularKeywords, setPopularKeywords] = useState<string[]>([]);        // Load popular keywords on mount and search if there's a query from URL
        useEffect(() => {
            const loadPopularKeywords = async () => {
                try {
                    const SearchService = (await import('@/services/search')).default;
                    const keywords = await SearchService.getPopularKeywords();
                    setPopularKeywords(keywords);
                } catch (error) {
                    console.error('Failed to load popular keywords:', error);
                }
            };
            
            loadPopularKeywords();
            // If there's a query from URL, perform search automatically
            if (queryFromUrl.trim()) {
                handleSearch(queryFromUrl);
            }
        }, [queryFromUrl]);

    // Handle clicks outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Element;
            if (!target.closest('.search-container')) {
                setShowSuggestions(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);    // Handle search input change with suggestions
    const handleSearchInputChange = async (value: string) => {
        setSearchKeyword(value);
        
        if (value.trim().length >= 2) {
            try {
                const SearchService = (await import('@/services/search')).default;
                const suggestionResults = await SearchService.getSuggestions(value);
                setSuggestions(suggestionResults);
                setShowSuggestions(true);
            } catch (error) {
                console.error('Failed to load suggestions:', error);
                setSuggestions([]);
            }
        } else {
            setSuggestions([]);
            setShowSuggestions(false);
        }
    };    // Handle search execution
    const handleSearch = async (keyword: string) => {
        if (keyword.trim()) {
            await search(keyword);
            const SearchService = (await import('@/services/search')).default;
            SearchService.saveSearchHistory(keyword);
            setShowSuggestions(false);
        }
    };

    // Handle type filter change
    const handleTypeChange = (type: 'all' | 'food' | 'stall') => {
        updateFilters({ type });
    };    // Handle suggestion click
    const handleSuggestionClick = (suggestion: any) => {
        setShowSuggestions(false);
        if (suggestion.type === 'food') {
            router.push(`/detailfood/${suggestion.id}`);
        } else if (suggestion.type === 'stall') {
            router.push(`/stall/${suggestion.id}`);
        } else {
            // Fallback to search if type is not recognized
            setSearchKeyword(suggestion.name);
            handleSearch(suggestion.name);
        }
    };

    // Format search results for display
    const formatResultsForDisplay = () => {
        if (!searchResults) return [];

        const items: any[] = [];
        
        // Add foods to results
        if (searchResults.foods?.data) {
            searchResults.foods.data.forEach(food => {
                items.push({
                    id: food.id,
                    name: food.name,
                    address: food.stall?.address || '',
                    img: food.image_url || '/food/ga1.jpg',
                    kind: 'Món Ăn',
                    type: 'food',
                    price: food.price,
                    rating: food.avg_rating,
                    stall: food.stall
                });
            });
        }

        // Add stalls to results
        if (searchResults.stalls?.data) {
            searchResults.stalls.data.forEach(stall => {
                items.push({
                    id: stall.id,
                    name: stall.name,
                    address: stall.address || '',
                    img: stall.image_url || '/food/ga1.jpg',
                    kind: 'Quán Ăn',
                    type: 'stall',
                    rating: stall.avg_rating,
                    category: stall.category
                });
            });
        }

        return items;
    };    const displayItems = formatResultsForDisplay();    return (
        <>
            <div className='w-full flex flex-row justify-between items-center border-b border-solid'>
                <div className='flex flex-row gap-3'>
                    <AreaSelector />
                    <TypeSelector onTypeChange={handleTypeChange} selectedType={filters.type} />
                </div>                <div className='flex items-center justify-center'>
                    <FilterSelector 
                        onFilterChange={updateFilters} 
                        filters={filters}
                        resultCount={(searchResults?.foods?.meta?.total || 0) + (searchResults?.stalls?.meta?.total || 0)}
                    />
                </div>
            </div>
              {/* Search Input Section */}
            <div className='my-4 relative search-container'>
                <Search
                    placeholder="Tìm kiếm món ăn, quán ăn..."
                    allowClear
                    enterButton={<SearchOutlined />}
                    size="large"
                    value={searchKeyword}
                    onChange={(e) => handleSearchInputChange(e.target.value)}
                    onSearch={handleSearch}
                    loading={loading}
                />
                
                {/* Suggestions Dropdown */}
                {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-60 overflow-y-auto">
                        {suggestions.map((suggestion, index) => (
                            <div
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer border-b border-gray-100 last:border-b-0"
                                onClick={() => handleSuggestionClick(suggestion)}
                            >
                                <div className="font-medium">{suggestion.name}</div>
                                {suggestion.category && (
                                    <div className="text-sm text-gray-500">{suggestion.category}</div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Popular Keywords */}
            {popularKeywords.length > 0 && !searchKeyword && (
                <div className='mb-4'>
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Từ khóa phổ biến:</h3>
                    <div className="flex flex-wrap gap-2">
                        {popularKeywords.map((keyword, index) => (
                            <span
                                key={index}
                                className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm cursor-pointer hover:bg-gray-200 transition-colors"
                                onClick={() => handleSearch(keyword)}
                            >
                                {keyword}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Loading State */}
            {loading && (
                <div className="flex justify-center items-center py-8">
                    <Spin size="large" />
                    <span className="ml-2">Đang tìm kiếm...</span>
                </div>
            )}

            {/* Search Results */}
            {!loading && searchResults && (
                <div className="mb-4">
                    <div className="text-sm text-gray-600 mb-3">
                        Tìm thấy {(searchResults.foods?.meta?.total || 0) + (searchResults.stalls?.meta?.total || 0)} kết quả
                        {searchKeyword && ` cho "${searchKeyword}"`}
                    </div>
                </div>
            )}

            <ResultFood items={displayItems} />
        </>
    )
}
export default Page;