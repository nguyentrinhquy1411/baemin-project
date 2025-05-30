"use client";

import { useState, useCallback } from "react";
import { message } from "antd";
import SearchService, { SearchResult, SearchFilters } from "@/services/search";

const useSearch = () => {
  const [searchResults, setSearchResults] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<SearchFilters>({
    type: "all",
    page: 1,
    limit: 20,
    sortBy: "name",
    sortOrder: "asc",
  });

  const search = useCallback(
    async (keyword: string, customFilters?: Partial<SearchFilters>) => {
      try {
        setLoading(true);
        const searchFilters = {
          ...filters,
          ...customFilters,
          keyword: keyword.trim(),
        };

        const results = await SearchService.search(searchFilters);
        setSearchResults(results);

        // Update filters with the search params
        if (customFilters) {
          setFilters((prev) => ({ ...prev, ...customFilters }));
        }

        return results;
      } catch (error) {
        console.error("Search failed:", error);
        message.error("Tìm kiếm thất bại. Vui lòng thử lại!");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  const updateFilters = useCallback(
    (newFilters: Partial<SearchFilters>) => {
      const updatedFilters = { ...filters, ...newFilters, page: 1 };
      setFilters(updatedFilters);

      // Re-search with new filters if there's a current keyword
      const keyword = searchResults?.keyword || "";
      if (keyword || newFilters.type || newFilters.categoryId) {
        search(keyword, updatedFilters);
      }
    },
    [filters, searchResults, search]
  );

  const clearSearch = useCallback(() => {
    setSearchResults(null);
    setFilters({
      type: "all",
      page: 1,
      limit: 20,
      sortBy: "name",
      sortOrder: "asc",
    });
  }, []);

  return {
    searchResults,
    loading,
    filters,
    search,
    updateFilters,
    clearSearch,
  };
};

export default useSearch;
