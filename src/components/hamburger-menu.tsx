import { useState } from "react";
import { createPortal } from "react-dom";
import styles from "./hamburger-menu.module.scss";
import type { FilterSettings, SavedAddress } from "@/lib/types";
import { LoginDialog } from "@/features/auth/components";
import { APP_OVERLAY_ROOT_ID } from "@/app/AppLayout";
import { X, MapPin, Car, Users, Dog, RefreshCw, History, CircleUserRound, Save, Plus, Trash2, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: string;
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
  savedAddresses: SavedAddress[];
  onAddAddress: (address: SavedAddress) => void;
  onRemoveAddress: (id: string) => void;
  onSelectAddress: (address: SavedAddress) => void;
}

export function HamburgerMenu({
  isOpen,
  onClose,
  currentLocation,
  filterSettings,
  onFilterChange,
  savedAddresses,
  onAddAddress,
  onRemoveAddress,
  onSelectAddress,
}: HamburgerMenuProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [newAddressValue, setNewAddressValue] = useState("");
  const [activeFilterSection, setActiveFilterSection] = useState<"range" | "amenities" | null>(null);
  const [showLogin, setShowLogin] = useState(false);

  const handleAddAddress = () => {
    if (newAddressLabel.trim() && newAddressValue.trim()) {
      onAddAddress({
        id: Date.now().toString(),
        label: newAddressLabel.trim(),
        address: newAddressValue.trim(),
        isDefault: savedAddresses.length === 0,
      });
      setNewAddressLabel("");
      setNewAddressValue("");
      setShowAddressForm(false);
    }
  };

  const searchRangeOptions: Array<{ value: 50 | 100 | 250; label: string }> = [
    { value: 50, label: "50m" },
    { value: 100, label: "100m (기본)" },
    { value: 250, label: "250m" },
  ];

  const overlayRoot = typeof document !== "undefined" ? document.getElementById(APP_OVERLAY_ROOT_ID) : null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-auto absolute inset-0 z-40 bg-foreground/50"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="pointer-events-auto absolute inset-y-0 left-0 z-50 w-80 overflow-y-auto bg-card shadow-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border p-4">
              <h2 className="text-xl font-bold text-card-foreground">설정</h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted cursor-pointer"
                aria-label="닫기"
              >
                <X className="size-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-4">
              {/* Current Location */}
              <div className="mb-6">
                <h3 className="mb-2 text-sm font-medium text-muted-foreground">내 위치</h3>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 text-left transition-colors hover:bg-muted cursor-pointer"
                >
                  <MapPin className="size-5 text-primary" />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-card-foreground">{currentLocation}</p>
                    <p className="text-xs text-muted-foreground">탭하여 위치 변경</p>
                  </div>
                  <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
                </button>
              </div>

              {/* Search Range */}
              <div className="mb-6">
                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-between text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => setActiveFilterSection(activeFilterSection === "range" ? null : "range")}
                >
                  <span>검색 범위</span>
                  <motion.span
                    animate={{
                      rotate: activeFilterSection === "range" ? 90 : 0,
                    }}
                  >
                    <ChevronRight className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeFilterSection === "range" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-2 py-2">
                        {searchRangeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              onFilterChange({
                                ...filterSettings,
                                searchRange: option.value,
                              })
                            }
                            className={`flex-1 rounded-xl px-3 py-3 text-sm font-medium transition-colors cursor-pointer ${
                              filterSettings.searchRange === option.value
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-muted-foreground hover:bg-muted/80 cursor-pointer"
                            }`}
                          >
                            {option.label}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeFilterSection !== "range" && (
                  <div className="rounded-xl bg-muted/50 px-4 py-2 text-sm text-card-foreground">현재: {filterSettings.searchRange}m</div>
                )}
              </div>

              {/* Filters */}
              <div className="mb-6">
                <button
                  type="button"
                  className="mb-2 flex w-full items-center justify-between text-sm font-medium text-muted-foreground cursor-pointer"
                  onClick={() => setActiveFilterSection(activeFilterSection === "amenities" ? null : "amenities")}
                >
                  <span>필터</span>
                  <motion.span
                    animate={{
                      rotate: activeFilterSection === "amenities" ? 90 : 0,
                    }}
                  >
                    <ChevronRight className="size-4" />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeFilterSection === "amenities" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="space-y-2 py-2">
                        <FilterToggle
                          icon={<Car className="size-4" />}
                          label="주차장"
                          value={filterSettings.hasParking}
                          onChange={(v) =>
                            onFilterChange({
                              ...filterSettings,
                              hasParking: v,
                            })
                          }
                        />
                        <FilterToggle
                          icon={<Users className="size-4" />}
                          label="단체석"
                          value={filterSettings.hasGroupSeating}
                          onChange={(v) =>
                            onFilterChange({
                              ...filterSettings,
                              hasGroupSeating: v,
                            })
                          }
                        />
                        <FilterToggle
                          icon={<Dog className="size-4" />}
                          label="반려동물"
                          value={filterSettings.petFriendly}
                          onChange={(v) =>
                            onFilterChange({
                              ...filterSettings,
                              petFriendly: v,
                            })
                          }
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeFilterSection !== "amenities" && (
                  <div className="flex flex-wrap gap-2">
                    {filterSettings.hasParking && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        <Car className="size-3" /> 주차장
                      </span>
                    )}
                    {filterSettings.hasGroupSeating && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        <Users className="size-3" /> 단체석
                      </span>
                    )}
                    {filterSettings.petFriendly && (
                      <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs text-primary">
                        <Dog className="size-3" /> 반려동물
                      </span>
                    )}
                    {!filterSettings.hasParking && !filterSettings.hasGroupSeating && !filterSettings.petFriendly && (
                      <span className="text-sm text-muted-foreground">필터 없음</span>
                    )}
                  </div>
                )}
              </div>

              {/* Saved Addresses */}
              <div className="mb-6">
                <div className="mb-2 flex items-center justify-between">
                  <h3 className="text-sm font-medium text-muted-foreground">저장된 주소</h3>
                  <button
                    type="button"
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="rounded-full p-1 text-primary transition-colors hover:bg-primary/10 cursor-pointer"
                  >
                    <Plus className="size-4" />
                  </button>
                </div>

                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="mb-3 overflow-hidden"
                    >
                      <div className="space-y-2 rounded-xl bg-muted/50 p-3">
                        <input
                          type="text"
                          placeholder="라벨 (예: 집, 회사)"
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          className="w-full rounded-lg bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <input
                          type="text"
                          placeholder="주소"
                          value={newAddressValue}
                          onChange={(e) => setNewAddressValue(e.target.value)}
                          className="w-full rounded-lg bg-card px-3 py-2 text-sm text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className="flex w-full items-center justify-center gap-1 rounded-lg bg-primary py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 cursor-pointer"
                        >
                          <Save className="size-4" />
                          저장
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div className="space-y-2">
                  {savedAddresses.map((address) => (
                    <div key={address.id} className="flex items-center gap-3 rounded-xl bg-muted/50 p-3">
                      <button type="button" onClick={() => onSelectAddress(address)} className="min-w-0 flex-1 text-left">
                        <p className="font-medium text-card-foreground">{address.label}</p>
                        <p className="text-xs text-muted-foreground">{address.address}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveAddress(address.id)}
                        className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive cursor-pointer"
                        aria-label={`${address.label} 삭제`}
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && <p className="py-4 text-center text-sm text-muted-foreground">저장된 주소가 없습니다</p>}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-2">
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 text-left transition-colors hover:bg-muted cursor-pointer"
                >
                  <CircleUserRound className="size-5 text-primary" />
                  <span className="font-medium text-card-foreground">로그인</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 text-left transition-colors hover:bg-muted cursor-pointer"
                >
                  <RefreshCw className="size-5 text-primary" />
                  <span className="font-medium text-card-foreground">동기화</span>
                </button>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-xl bg-muted/50 p-4 text-left transition-colors hover:bg-muted cursor-pointer"
                >
                  <History className="size-5 text-primary" />
                  <span className="font-medium text-card-foreground">히스토리</span>
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {overlayRoot ? createPortal(menuContent, overlayRoot) : null}
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onSubmit={async (v) => console.log("Login", v)} />
    </>
  );
}

interface FilterToggleProps {
  icon: React.ReactNode;
  label: string;
  value: boolean | null;
  onChange: (value: boolean | null) => void;
}

function FilterToggle({ icon, label, value, onChange }: FilterToggleProps) {
  const states: Array<{ value: boolean | null; label: string }> = [
    { value: null, label: "상관없음" },
    { value: true, label: "있음" },
    { value: false, label: "없음" },
  ];

  const currentIndex = states.findIndex((s) => s.value === value);

  const handleClick = () => {
    const nextIndex = (currentIndex + 1) % states.length;
    onChange(states[nextIndex].value);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="flex w-full items-center justify-between rounded-xl bg-muted/50 p-3 transition-colors hover:bg-muted cursor-pointer"
    >
      <div className="flex items-center gap-2">
        <span className={value === true ? "text-primary" : "text-muted-foreground"}>{icon}</span>
        <span className="text-sm font-medium text-card-foreground">{label}</span>
      </div>
      <span
        className={`rounded-full px-2 py-0.5 text-xs ${
          value === true
            ? "bg-primary text-primary-foreground"
            : value === false
              ? "bg-destructive/10 text-destructive"
              : "bg-muted text-muted-foreground"
        }`}
      >
        {states[currentIndex].label}
      </span>
    </button>
  );
}
