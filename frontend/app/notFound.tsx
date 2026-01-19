import { Link } from "react-router";

export const meta = () => {
  return [
    { title: "404 - Page Not Found" },
    { name: "description", content: "Page not found" },
  ];
};

const NotFound = () => {
  return (
    <div className="p-4 text-center">
      <h1 className="text-2xl font-bold mb-2">404 - Page Not Found</h1>
      <p className="mb-4">The page you're looking for doesn't exist.</p>
      <Link to="/" className="text-blue-500 hover:underline">
        Return to Home
      </Link>
    </div>
  );
};

export default NotFound;
