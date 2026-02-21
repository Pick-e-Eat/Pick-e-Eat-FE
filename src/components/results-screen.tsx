import type { SwipeResult } from "@/lib/types";
import { Star, MapPin, ThumbsUp, ThumbsDown, RotateCcw, Navigation } from "lucide-react";
import { motion } from "framer-motion";
import { useResultsStore } from "@/shared/stores/results-store";

interface ResultsScreenProps {
  onContinue: () => void;
  onReset: () => void;
}

export function ResultsScreen({ onContinue, onReset }: ResultsScreenProps) {
  const { results } = useResultsStore();
  const likedRestaurants = results.filter((r) => r.liked);
  const dislikedRestaurants = results.filter((r) => !r.liked);

  return (
    <div className="flex min-h-dvh flex-col bg-background">
      {/* Header */}
      <div className="border-b border-border bg-card px-6 py-6">
        <h1 className="text-center text-2xl font-bold text-card-foreground">검색 결과</h1>
        <p className="mt-1 text-center text-sm text-muted-foreground">
          총 {results.length}개 중 {likedRestaurants.length}개를 선택했어요
        </p>
      </div>

      {/* Results */}
      <div className="flex-1 overflow-y-auto p-4">
        {/* Liked Section */}
        {likedRestaurants.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <ThumbsUp className="size-5 text-like" />
              <h2 className="text-lg font-semibold text-card-foreground">
                좋아요 ({likedRestaurants.length})
              </h2>
            </div>
            <div className="space-y-3">
              {likedRestaurants.map((result, index) => (
                <motion.div
                  key={result.restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
                >
                  <div className="flex">
                    <div
                      className="h-24 w-24 shrink-0 bg-cover bg-center"
                      style={{ backgroundImage: `url(${result.restaurant.image})` }}
                    />
                    <div className="flex flex-1 flex-col justify-center p-3">
                      <h3 className="font-semibold text-card-foreground">
                        {result.restaurant.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {result.restaurant.type}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <div className="flex items-center gap-0.5">
                          <Star className="size-3 fill-amber-400 text-amber-400" />
                          <span className="text-xs font-medium text-card-foreground">
                            {result.restaurant.rating}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          도보 {result.restaurant.walkingTime}분
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col items-center justify-center gap-2 p-3">
                      <button
                        type="button"
                        className="rounded-full bg-accent p-2 text-accent-foreground transition-colors hover:bg-accent/80"
                        aria-label="길찾기"
                      >
                        <Navigation className="size-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Disliked Section */}
        {dislikedRestaurants.length > 0 && (
          <div className="mb-6">
            <div className="mb-3 flex items-center gap-2">
              <ThumbsDown className="size-5 text-unlike" />
              <h2 className="text-lg font-semibold text-card-foreground">
                다음에 ({dislikedRestaurants.length})
              </h2>
            </div>
            <div className="space-y-2">
              {dislikedRestaurants.map((result, index) => (
                <motion.div
                  key={result.restaurant.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (likedRestaurants.length + index) * 0.1 }}
                  className="flex items-center gap-3 rounded-xl bg-muted/30 p-3"
                >
                  <div
                    className="h-12 w-12 shrink-0 rounded-lg bg-cover bg-center"
                    style={{ backgroundImage: `url(${result.restaurant.image})` }}
                  />
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-medium text-card-foreground">
                      {result.restaurant.name}
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      {result.restaurant.type}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {results.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <MapPin className="mb-4 size-12 text-muted-foreground" />
            <p className="text-lg font-medium text-card-foreground">아직 결과가 없어요</p>
            <p className="text-sm text-muted-foreground">
              음식점을 스와이프해서 선택해주세요
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="border-t border-border bg-card p-4">
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onReset}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-border bg-card py-4 font-medium text-card-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-5" />
            처음부터
          </button>
          <button
            type="button"
            onClick={onContinue}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-4 font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            더 검색하기
          </button>
        </div>
      </div>
    </div>
  );
}
