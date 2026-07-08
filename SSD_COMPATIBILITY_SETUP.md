# SSD Compatibility Setup

Google Sheet එකේ `Product_Database` tab එකට මේ columns තියෙන්න ඕන:

- `storageSupport` = Motherboard එකට support කරන SSD types
- `storageType` = SSD product එකේ type එක

## Motherboard add කරන විදිහ

`storageSupport` column එකට මෙහෙම දාන්න:

- SATA විතරක් support නම්: `SATA SSD`
- SATA + M.2 SATA support නම්: `SATA SSD | M.2 SSD`
- SATA + M.2 SATA + NVMe support නම්: `SATA SSD | M.2 SSD | NVME SSD`

## SSD product add කරන විදිහ

SSD product row එකේ `storageType` column එකට මේ තුනෙන් එකක් දාන්න:

- `SATA SSD`
- `M.2 SSD`
- `NVME SSD`

## Quotation Page එකේ වැඩ කරන විදිහ

Customer motherboard එක select කළාම SSD dropdown එකේ පෙන්වන්නේ ඒ motherboard `storageSupport` column එකට match වෙන SSD products විතරයි.

Example:

- H81 motherboard → `SATA SSD` → only SATA SSD show
- H110 M.2 motherboard → `SATA SSD | M.2 SSD` → SATA + M.2 SSD show
- B250 NVMe motherboard → `SATA SSD | M.2 SSD | NVME SSD` → all three show

