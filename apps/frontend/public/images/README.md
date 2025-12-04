# Images Directory

Place your logo and other image assets here.

## Logo Files

- `logo.png` or `logo.svg` - Main OmegaFrame Studio logo
- `logo-icon.png` or `logo-icon.svg` - Icon-only version of the logo
- `favicon.ico` - Browser favicon

## Usage

Images in this directory can be referenced in your components using:

```tsx
import Image from 'next/image'

<Image src="/images/logo.png" alt="OmegaFrame Studio" width={200} height={50} />
```

Or directly in img tags:

```tsx
<img src="/images/logo.png" alt="OmegaFrame Studio" />
```

