import FirstPageIcon from "@mui/icons-material/FirstPage";
import KeyboardArrowLeftIcon from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRightIcon from "@mui/icons-material/KeyboardArrowRight";
import LastPageIcon from "@mui/icons-material/LastPage";
import { Button, IconButton, Stack, Typography } from "@mui/material";

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
  // ページ番号のリストを生成するロジック
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 1; // current page の前後に表示するページ数

    if (totalPage <= 1) return [];

    // 常に1ページ目は表示
    pages.push(1);

    // 省略記号が必要かどうかの判定
    // 2ページ目から (current - maxVisible - 1) までの間にギャップがあれば ... を入れる
    // ただし、ギャップが1つだけならその数字を入れる

    const start = Math.max(2, currentPage - maxVisible);
    const end = Math.min(totalPage - 1, currentPage + maxVisible);

    if (start > 2) {
      pages.push("...");
    }

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    if (end < totalPage - 1) {
      pages.push("...");
    }

    // 最後のページを表示
    if (totalPage > 1) {
      pages.push(totalPage);
    }

    return pages;
  };

  const pages = getPageNumbers();

  if (totalPage === 0) return null;

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      justifyContent="center"
      sx={{ mt: 2 }}
    >
      <IconButton
        onClick={() => onChange(1)}
        disabled={currentPage === 1}
        aria-label="first page"
      >
        <FirstPageIcon />
      </IconButton>
      <IconButton
        onClick={() => onChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="previous page"
      >
        <KeyboardArrowLeftIcon />
      </IconButton>

      {pages.map((page, index) =>
        typeof page === "number" ? (
          <Button
            key={page}
            variant={page === currentPage ? "contained" : "outlined"}
            onClick={() => onChange(page)}
            sx={{ minWidth: "40px", p: 1 }}
          >
            {page}
          </Button>
        ) : (
          <Typography key={`ellipsis-${index}`}>...</Typography>
        ),
      )}

      <IconButton
        onClick={() => onChange(currentPage + 1)}
        disabled={currentPage === totalPage}
        aria-label="next page"
      >
        <KeyboardArrowRightIcon />
      </IconButton>
      <IconButton
        onClick={() => onChange(totalPage)}
        disabled={currentPage === totalPage}
        aria-label="last page"
      >
        <LastPageIcon />
      </IconButton>
    </Stack>
  );
}
