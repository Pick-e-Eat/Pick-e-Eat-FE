// 검색 입력 UI를 재사용 가능한 조합으로 분리
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export function SearchInput({ value, onChange, onSearch }: SearchInputProps) {
  return (
    <div className="flex gap-2">
      <Input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder="검색어를 입력하세요"
      />
      <Button type="button" variant="outline" onClick={onSearch}>
        검색
      </Button>
    </div>
  );
}
