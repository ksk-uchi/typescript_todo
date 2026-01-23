import { Pagination, Stack } from "@mui/material";

interface PaginationControlProps {
  currentPage: number;
  totalPage: number;
  onChange: (page: number) => void;
}

export default function PaginationControl({
  currentPage,
  totalPage,
  onChange,
}: PaginationControlProps) {
  if (totalPage === 0) return null;

  return (
    <Stack direction="row" justifyContent="center" sx={{ mt: 2 }}>
      <Pagination
        count={totalPage}
        page={currentPage}
        onChange={(_, page) => onChange(page)}
        showFirstButton
        showLastButton
        color="primary"
      />
    </Stack>
  );
}
