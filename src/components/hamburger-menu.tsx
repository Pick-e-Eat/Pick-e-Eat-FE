import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  ChevronRight,
  // CircleUserRound,
  Dog,
  // History,
  MapPin,
  Plus,
  // RefreshCw,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { APP_OVERLAY_ROOT_ID } from "@/app/AppLayout";
import { BrandWordmark } from "@/components/brand-wordmark";
// import { LoginDialog } from "@/features/auth/components";
import type { FilterSettings, SavedAddress } from "@/lib/types";
import { MAX_SAVED_ADDRESSES } from "@/shared/stores/saved-addresses-store";
import { cn } from "@/shared/utils/cn";
import styles from "./hamburger-menu.module.css";

function coordsKey(lat: number, lng: number) {
  return `${Math.round(lat * 1e5) / 1e5},${Math.round(lng * 1e5) / 1e5}`;
}

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocationPicker: () => void;
  onOpenSaveLocationPicker: () => void;
  disableOpenAnimation?: boolean;
  currentLocation: string;
  currentLatitude: number;
  currentLongitude: number;
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
  savedAddresses: SavedAddress[];
  /** 저장 주소가 이미 최대 개수일 때 (+ 클릭 또는 저장 시 상위에서 모달 등 처리) */
  onSavedAddressLimit: () => void;
  onRemoveAddress: (id: string) => void;
  onSelectAddress: (address: SavedAddress) => void;
}

export function HamburgerMenu({
  isOpen,
  onClose,
  onOpenLocationPicker,
  onOpenSaveLocationPicker,
  disableOpenAnimation = false,
  currentLocation,
  currentLatitude,
  currentLongitude,
  filterSettings,
  onFilterChange,
  savedAddresses,
  onSavedAddressLimit,
  onRemoveAddress,
  onSelectAddress,
}: HamburgerMenuProps) {
  const [activeFilterSection, setActiveFilterSection] = useState<"range" | "amenities" | null>(
    null,
  );
  // const [showLogin, setShowLogin] = useState(false);
  const locationLabelOverride =
    savedAddresses.find(
      (address) =>
        typeof address.latitude === "number" &&
        typeof address.longitude === "number" &&
        coordsKey(address.latitude, address.longitude) ===
          coordsKey(currentLatitude, currentLongitude),
    )?.label ?? null;
  const currentLocationTitle = locationLabelOverride ?? currentLocation;

  const searchRangeOptions: Array<{ value: 50 | 100 | 250; label: string; sub?: string }> = [
    { value: 50, label: "50m" },
    { value: 100, label: "100m", sub: "(기본)" },
    { value: 250, label: "250m" },
  ];

  const overlayRoot =
    typeof document !== "undefined" ? document.getElementById(APP_OVERLAY_ROOT_ID) : null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={disableOpenAnimation ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div
            initial={disableOpenAnimation ? false : { x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "tween", duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className={styles.menuContainer}
          >
            {/* Header — 모달형: 중앙 타이틀 + 우측 닫기 */}
            <div className={styles.header}>
              <div className={styles.headerLead} aria-hidden />
              <BrandWordmark variant="menu" as="h2" className={styles.headerWordmark} />
              <button
                type="button"
                onClick={onClose}
                className={styles.closeButton}
                aria-label="닫기"
              >
                <X className={styles.closeIcon} />
              </button>
            </div>

            {/* Content */}
            <div className={styles.content}>
              {/* Current Location */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>내 위치</h3>
                <button
                  type="button"
                  className={styles.locationButton}
                  onClick={onOpenLocationPicker}
                >
                  <MapPin className={styles.locationIcon} />
                  <div className={styles.locationTextContainer}>
                    <p className={styles.locationAddress}>{currentLocationTitle}</p>
                    {locationLabelOverride ? (
                      <p className={styles.addressValue}>{currentLocation}</p>
                    ) : null}
                  </div>
                  <ChevronRight className={styles.chevronIcon} />
                </button>
              </div>

              {/* Search Range */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionToggleButton}
                  onClick={() =>
                    setActiveFilterSection(activeFilterSection === "range" ? null : "range")
                  }
                >
                  <span>검색 범위</span>
                  <motion.span animate={{ rotate: activeFilterSection === "range" ? 90 : 0 }}>
                    <ChevronRight className={styles.sectionToggleIcon} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeFilterSection === "range" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.collapsibleSection}
                    >
                      <div className={styles.rangeOptionsContainer}>
                        {searchRangeOptions.map((option) => (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              onFilterChange({ ...filterSettings, searchRange: option.value })
                            }
                            className={cn(
                              styles.rangeOptionButton,
                              filterSettings.searchRange === option.value
                                ? styles.rangeOptionButtonActive
                                : styles.rangeOptionButtonInactive,
                            )}
                          >
                            <span>{option.label}</span>
                            {option.sub ? (
                              <span className={styles.rangeOptionSub}>{option.sub}</span>
                            ) : null}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeFilterSection !== "range" && (
                  <div className={styles.currentRangeDisplay}>
                    현재: {filterSettings.searchRange}m
                  </div>
                )}
              </div>

              {/* Filters */}
              <div className={styles.section}>
                <button
                  type="button"
                  className={styles.sectionToggleButton}
                  onClick={() =>
                    setActiveFilterSection(activeFilterSection === "amenities" ? null : "amenities")
                  }
                >
                  <span>필터</span>
                  <motion.span animate={{ rotate: activeFilterSection === "amenities" ? 90 : 0 }}>
                    <ChevronRight className={styles.sectionToggleIcon} />
                  </motion.span>
                </button>
                <AnimatePresence>
                  {activeFilterSection === "amenities" && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.collapsibleSection}
                    >
                      <div className={styles.filterTogglesContainer}>
                        <FilterToggle
                          icon={<Car className={styles.sectionToggleIcon} />}
                          label="주차장"
                          value={filterSettings.hasParking}
                          onChange={(v) => onFilterChange({ ...filterSettings, hasParking: v })}
                        />
                        <FilterToggle
                          icon={<Users className={styles.sectionToggleIcon} />}
                          label="단체석"
                          value={filterSettings.hasGroupSeating}
                          onChange={(v) =>
                            onFilterChange({ ...filterSettings, hasGroupSeating: v })
                          }
                        />
                        <FilterToggle
                          icon={<Dog className={styles.sectionToggleIcon} />}
                          label="반려동물"
                          value={filterSettings.petFriendly}
                          onChange={(v) => onFilterChange({ ...filterSettings, petFriendly: v })}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
                {activeFilterSection !== "amenities" && (
                  <div className={styles.activeFiltersContainer}>
                    {filterSettings.hasParking && (
                      <span className={styles.activeFilterBadge}>
                        <Car className={styles.activeFilterIcon} /> 주차장
                      </span>
                    )}
                    {filterSettings.hasGroupSeating && (
                      <span className={styles.activeFilterBadge}>
                        <Users className={styles.activeFilterIcon} /> 단체석
                      </span>
                    )}
                    {filterSettings.petFriendly && (
                      <span className={styles.activeFilterBadge}>
                        <Dog className={styles.activeFilterIcon} /> 반려동물
                      </span>
                    )}
                    {!filterSettings.hasParking &&
                      !filterSettings.hasGroupSeating &&
                      !filterSettings.petFriendly && (
                        <span className={styles.noFiltersText}>필터 없음</span>
                      )}
                  </div>
                )}
              </div>

              {/* Saved Addresses */}
              <div className={styles.section}>
                <div className={styles.addressHeader}>
                  <h3 className={styles.sectionTitle}>저장된 주소</h3>
                  <button
                    type="button"
                    onClick={() => {
                      if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
                        onSavedAddressLimit();
                        return;
                      }
                      onOpenSaveLocationPicker();
                    }}
                    className={cn(
                      styles.addAddressButton,
                      savedAddresses.length >= MAX_SAVED_ADDRESSES
                        ? styles.addAddressButtonAtLimit
                        : undefined,
                    )}
                    title={
                      savedAddresses.length >= MAX_SAVED_ADDRESSES
                        ? `주소는 최대 ${MAX_SAVED_ADDRESSES}개까지 저장할 수 있어요`
                        : "주소 추가"
                    }
                    aria-label={
                      savedAddresses.length >= MAX_SAVED_ADDRESSES
                        ? `주소는 최대 ${MAX_SAVED_ADDRESSES}개까지 저장 가능`
                        : "주소 추가"
                    }
                  >
                    <Plus className={styles.addAddressIcon} />
                  </button>
                </div>

                <div className={styles.addressList}>
                  {savedAddresses.map((address) => (
                    <div key={address.id} className={styles.addressItem}>
                      <button
                        type="button"
                        onClick={() => onSelectAddress(address)}
                        className={styles.addressItemButton}
                      >
                        <p className={styles.addressLabel}>{address.label}</p>
                        <p className={styles.addressValue}>{address.address}</p>
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveAddress(address.id)}
                        className={styles.removeAddressButton}
                        aria-label={`${address.label} 삭제`}
                      >
                        <Trash2 className={styles.removeAddressIcon} />
                      </button>
                    </div>
                  ))}
                  {savedAddresses.length === 0 && (
                    <p className={styles.noAddressesText}>저장된 주소가 없습니다</p>
                  )}
                </div>
              </div>

              {/* Actions — 로그인 / 동기화 / 히스토리 (미사용)
              <div className={styles.actionsCard}>
                <button
                  type="button"
                  onClick={() => setShowLogin(true)}
                  className={styles.actionRow}
                >
                  <CircleUserRound className={styles.actionIcon} />
                  <span className={styles.actionLabel}>로그인</span>
                  <ChevronRight className={styles.actionChevron} />
                </button>
                <button type="button" className={styles.actionRow}>
                  <RefreshCw className={styles.actionIcon} />
                  <span className={styles.actionLabel}>동기화</span>
                  <ChevronRight className={styles.actionChevron} />
                </button>
                <button type="button" className={styles.actionRow}>
                  <History className={styles.actionIcon} />
                  <span className={styles.actionLabel}>히스토리</span>
                  <ChevronRight className={styles.actionChevron} />
                </button>
              </div>
              */}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {overlayRoot ? createPortal(menuContent, overlayRoot) : null}
      {/* <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onSubmit={async (v) => console.log("Login", v)}
      /> */}
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
    <button type="button" onClick={handleClick} className={styles.filterToggleButton}>
      <div className={styles.filterToggleLabelContainer}>
        <span
          className={cn(
            styles.filterToggleIcon,
            value === true ? styles.filterToggleIconActive : styles.filterToggleIconInactive,
          )}
        >
          {icon}
        </span>
        <span className={styles.filterToggleLabel}>{label}</span>
      </div>
      <span
        className={cn(
          styles.filterToggleState,
          value === true
            ? styles.filterToggleStateTrue
            : value === false
              ? styles.filterToggleStateFalse
              : styles.filterToggleStateNull,
        )}
      >
        {states[currentIndex].label}
      </span>
    </button>
  );
}
