import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  ChevronRight,
  CircleUserRound,
  Dog,
  History,
  Loader2,
  MapPin,
  Plus,
  RefreshCw,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";
import { APP_OVERLAY_ROOT_ID } from "@/app/AppLayout";
import { LoginDialog } from "@/features/auth/components";
import type { FilterSettings, SavedAddress } from "@/lib/types";
import { restaurantAPI } from "@/shared/api/restaurant";
import { MAX_SAVED_ADDRESSES } from "@/shared/stores/saved-addresses-store";
import type { LocationResult } from "@/shared/types/api.types";
import { cn } from "@/shared/utils/cn";
import { searchAddressWithGoogleGeocoder } from "@/shared/utils/google-geocode-address-search";
import styles from "./hamburger-menu.module.css";

const ADDRESS_SEARCH_DEBOUNCE_MS = 380;
const ADDRESS_SEARCH_MIN_LENGTH = 2;

interface HamburgerMenuProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenLocationPicker: () => void;
  currentLocation: string;
  /** 주소 자동완성 검색 시 Geocoder bounds 바이어스 (보통 현재 검색 위치 좌표) */
  addressSearchBiasLat: number;
  addressSearchBiasLng: number;
  filterSettings: FilterSettings;
  onFilterChange: (settings: FilterSettings) => void;
  savedAddresses: SavedAddress[];
  /** 저장 성공 시 true, 저장 안 됨(한도 등)이면 false */
  onAddAddress: (address: SavedAddress) => boolean;
  /** 저장 주소가 이미 최대 개수일 때 (+ 클릭 또는 저장 시 상위에서 모달 등 처리) */
  onSavedAddressLimit: () => void;
  onRemoveAddress: (id: string) => void;
  onSelectAddress: (address: SavedAddress) => void;
}

export function HamburgerMenu({
  isOpen,
  onClose,
  onOpenLocationPicker,
  currentLocation,
  addressSearchBiasLat,
  addressSearchBiasLng,
  filterSettings,
  onFilterChange,
  savedAddresses,
  onAddAddress,
  onSavedAddressLimit,
  onRemoveAddress,
  onSelectAddress,
}: HamburgerMenuProps) {
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddressLabel, setNewAddressLabel] = useState("");
  const [addressSearchQuery, setAddressSearchQuery] = useState("");
  const [addressSearchResults, setAddressSearchResults] = useState<LocationResult[]>([]);
  const [addressSearchLoading, setAddressSearchLoading] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<LocationResult | null>(null);
  const addressSearchSeq = useRef(0);
  const [activeFilterSection, setActiveFilterSection] = useState<"range" | "amenities" | null>(
    null,
  );
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      addressSearchSeq.current += 1;
      setShowAddressForm(false);
      setNewAddressLabel("");
      setAddressSearchQuery("");
      setAddressSearchResults([]);
      setPickedLocation(null);
      setAddressSearchLoading(false);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!showAddressForm) return;
    const q = addressSearchQuery.trim();
    if (q.length < ADDRESS_SEARCH_MIN_LENGTH) {
      setAddressSearchResults([]);
      setAddressSearchLoading(false);
      return;
    }

    const handle = window.setTimeout(() => {
      const id = ++addressSearchSeq.current;
      setAddressSearchLoading(true);
      void (async () => {
        try {
          const locations = await searchAddressWithGoogleGeocoder({
            query: q,
            contextAddress: currentLocation,
            biasLat: addressSearchBiasLat,
            biasLng: addressSearchBiasLng,
          });
          if (id !== addressSearchSeq.current) return;
          setAddressSearchResults(locations);
        } catch {
          try {
            const res = await restaurantAPI.searchText({ query: q });
            if (id !== addressSearchSeq.current) return;
            setAddressSearchResults(res.locations);
          } catch {
            if (id !== addressSearchSeq.current) return;
            setAddressSearchResults([]);
            toast.error("주소 검색에 실패했어요.");
          }
        } finally {
          if (id === addressSearchSeq.current) {
            setAddressSearchLoading(false);
          }
        }
      })();
    }, ADDRESS_SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(handle);
  }, [
    addressSearchBiasLat,
    addressSearchBiasLng,
    addressSearchQuery,
    currentLocation,
    showAddressForm,
  ]);

  const toggleAddressForm = () => {
    setShowAddressForm((prev) => {
      if (prev) {
        return false;
      }
      if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
        onSavedAddressLimit();
        return false;
      }
      setNewAddressLabel("");
      setAddressSearchQuery("");
      setAddressSearchResults([]);
      setPickedLocation(null);
      return true;
    });
  };

  const handlePickSuggestion = (loc: LocationResult) => {
    setPickedLocation(loc);
    setAddressSearchQuery(loc.name);
    setAddressSearchResults([]);
  };

  const handleAddAddress = () => {
    if (!newAddressLabel.trim() || !pickedLocation) {
      toast.message("라벨을 입력하고 목록에서 주소를 선택해 주세요.");
      return;
    }
    const addressLine = (pickedLocation.address?.trim() || pickedLocation.name).trim();
    if (savedAddresses.length >= MAX_SAVED_ADDRESSES) {
      onSavedAddressLimit();
      return;
    }
    const added = onAddAddress({
      id: Date.now().toString(),
      label: newAddressLabel.trim(),
      address: addressLine,
      isDefault: savedAddresses.length === 0,
      latitude: pickedLocation.latitude,
      longitude: pickedLocation.longitude,
    });
    if (added) {
      setNewAddressLabel("");
      setAddressSearchQuery("");
      setAddressSearchResults([]);
      setPickedLocation(null);
      setShowAddressForm(false);
    }
  };

  const searchRangeOptions: Array<{ value: 50 | 100 | 250; label: string }> = [
    { value: 50, label: "50m" },
    { value: 100, label: "100m (기본)" },
    { value: 250, label: "250m" },
  ];

  const overlayRoot =
    typeof document !== "undefined" ? document.getElementById(APP_OVERLAY_ROOT_ID) : null;

  const menuContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={styles.overlay}
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className={styles.menuContainer}
          >
            {/* Header — 모달형: 중앙 타이틀 + 우측 닫기 */}
            <div className={styles.header}>
              <div className={styles.headerLead} aria-hidden />
              <h2 className={styles.headerWordmark} aria-label="Pick-e-Eat">
                <span className={styles.headerWordPick}>Pick</span>
                <span className={styles.headerWordGlue} aria-hidden="true">
                  -e-
                </span>
                <span className={styles.headerWordEat}>Eat</span>
              </h2>
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
                    <p className={styles.locationAddress}>{currentLocation}</p>
                    <p className={styles.locationHint}>탭하여 위치 변경</p>
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
                            {option.label}
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
                    onClick={toggleAddressForm}
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

                <AnimatePresence>
                  {showAddressForm && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className={styles.addressFormContainer}
                    >
                      <div className={styles.addressForm}>
                        <input
                          type="text"
                          placeholder="라벨 (예: 집, 회사)"
                          value={newAddressLabel}
                          onChange={(e) => setNewAddressLabel(e.target.value)}
                          className={styles.addressInput}
                          autoComplete="off"
                        />
                        <div className={styles.addressSearchWrap}>
                          <input
                            type="text"
                            placeholder="주소 검색 (글자를 입력하면 후보가 나와요)"
                            value={addressSearchQuery}
                            onChange={(e) => {
                              setAddressSearchQuery(e.target.value);
                              setPickedLocation(null);
                            }}
                            className={styles.addressSearchInput}
                            autoComplete="off"
                          />
                          {addressSearchLoading ? (
                            <Loader2
                              className={styles.addressSearchSpinner}
                              aria-hidden
                              strokeWidth={2.25}
                            />
                          ) : null}
                        </div>
                        {addressSearchResults.length > 0 && (
                          <div className={styles.addressSuggestions}>
                            {addressSearchResults.map((loc) => (
                              <button
                                key={loc.place_id}
                                type="button"
                                className={styles.addressSuggestionItem}
                                onClick={() => handlePickSuggestion(loc)}
                              >
                                <span className={styles.addressSuggestionName}>{loc.name}</span>
                                {loc.address ? (
                                  <span className={styles.addressSuggestionAddress}>
                                    {loc.address}
                                  </span>
                                ) : null}
                              </button>
                            ))}
                          </div>
                        )}
                        {pickedLocation ? (
                          <p className={styles.addressPickedHint}>
                            선택됨:{" "}
                            <span className={styles.addressPickedText}>
                              {pickedLocation.address?.trim() || pickedLocation.name}
                            </span>
                          </p>
                        ) : (
                          <p className={styles.addressPickedHintMuted}>
                            후보를 탭해 선택한 뒤 저장을 눌러 주세요.
                          </p>
                        )}
                        <button
                          type="button"
                          onClick={handleAddAddress}
                          className={styles.saveAddressButton}
                          disabled={!newAddressLabel.trim() || !pickedLocation}
                        >
                          <Save className={styles.saveAddressIcon} />
                          저장
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

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

              {/* Actions */}
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
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {overlayRoot ? createPortal(menuContent, overlayRoot) : null}
      <LoginDialog
        open={showLogin}
        onOpenChange={setShowLogin}
        onSubmit={async (v) => console.log("Login", v)}
      />
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
