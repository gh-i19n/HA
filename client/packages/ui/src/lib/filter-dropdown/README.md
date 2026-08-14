# FilterDropdown Component

A reusable dropdown component for filtering data in tables and lists.

## Features

- ✅ Configurable filter options
- ✅ Customizable placeholder text
- ✅ Adjustable width
- ✅ Disabled state support
- ✅ TypeScript support
- ✅ Backward compatible with existing usage

## Usage

### Basic Usage

```tsx
import { FilterDropdown } from '@/components/shared/filter-dropdown';

function MyComponent() {
  const [status, setStatus] = useState('all');

  return <FilterDropdown value={status} onValueChange={setStatus} />;
}
```

### Custom Options

```tsx
import {
  FilterDropdown,
  type FilterOption,
} from '@/components/shared/filter-dropdown';

const productOptions: FilterOption[] = [
  { value: 'all', label: 'All Products' },
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
  { value: 'archived', label: 'Archived' },
];

function ProductFilter() {
  const [status, setStatus] = useState('all');

  return (
    <FilterDropdown
      value={status}
      onValueChange={setStatus}
      options={productOptions}
      placeholder="Product Status"
      width="w-[180px]"
    />
  );
}
```

## Props

| Prop            | Type                      | Default                      | Description                          |
| --------------- | ------------------------- | ---------------------------- | ------------------------------------ |
| `value`         | `string`                  | -                            | The currently selected value         |
| `onValueChange` | `(value: string) => void` | -                            | Callback function when value changes |
| `options`       | `FilterOption[]`          | Default order status options | Array of filter options              |
| `placeholder`   | `string`                  | `"Filter"`                   | Placeholder text for the dropdown    |
| `width`         | `string`                  | `"w-[123px]"`                | CSS width class for the dropdown     |
| `disabled`      | `boolean`                 | `false`                      | Whether the dropdown is disabled     |

## FilterOption Interface

```tsx
interface FilterOption {
  value: string;
  label: string;
}
```

## Default Options

The component comes with default order status options:

```tsx
[
  { value: 'all', label: 'All' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'pending', label: 'Pending' },
];
```

## Migration from Old Component

The component is backward compatible. Existing usage will continue to work without changes:

```tsx
// Old usage (still works)
<FilterDropdown value={status} onValueChange={handleStatusChange} />

// New usage with custom options
<FilterDropdown
  value={status}
  onValueChange={handleStatusChange}
  options={customOptions}
  placeholder="Custom Filter"
/>
```

## Examples

### Order Status Filter

```tsx
<FilterDropdown
  value={orderStatus}
  onValueChange={setOrderStatus}
  options={[
    { value: 'all', label: 'All Orders' },
    { value: 'pending', label: 'Pending' },
    { value: 'processing', label: 'Processing' },
    { value: 'shipped', label: 'Shipped' },
    { value: 'delivered', label: 'Delivered' },
    { value: 'cancelled', label: 'Cancelled' },
  ]}
  placeholder="Order Status"
/>
```

### User Status Filter

```tsx
<FilterDropdown
  value={userStatus}
  onValueChange={setUserStatus}
  options={[
    { value: 'all', label: 'All Users' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'suspended', label: 'Suspended' },
  ]}
  placeholder="User Status"
  width="w-[150px]"
/>
```

### Disabled State

```tsx
<FilterDropdown
  value={status}
  onValueChange={setStatus}
  disabled={isLoading}
  placeholder="Loading..."
/>
```
