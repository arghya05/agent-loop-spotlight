const AlgonomyLogo = ({ className = "h-8" }: { className?: string }) => (
  <svg 
    viewBox="0 0 200 32" 
    className={className}
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
  >
    <text 
      x="0" 
      y="24" 
      fontFamily="system-ui, -apple-system, sans-serif" 
      fontWeight="700" 
      fontSize="24" 
      letterSpacing="2"
    >
      ALGONOMY
    </text>
  </svg>
);

export default AlgonomyLogo;
