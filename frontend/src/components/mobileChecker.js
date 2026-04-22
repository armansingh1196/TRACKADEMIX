const [isMobile, setIsMobile] = useState(false);

useEffect(() => {
    const handleResize = () => {
        const isMobileDevice = window.matchMedia("(max-width: 768px)").matches;
        setIsMobile(isMobileDevice);
    };
    window.addEventListener("resize", handleResize);
    handleResize(); // Initialize the value on the first render
    return () => {
        window.removeEventListener("resize", handleResize);
    };
}, []);

{/* {
          isMobile ?
            <ActionMenu row={row} actions={actions} />
            :
            <StyledSpeedDial
              ariaLabel="SpeedDial playground example"
              icon={<SpeedDialIcon />}
              direction="right"
            >
              {actions.map((action) => (
                <SpeedDialAction
                  key={action.name}
                  icon={action.icon}
                  tooltipTitle={action.name}
                  onClick={action.action}
                />
              ))}
            </StyledSpeedDial>
        } */}

const StyledSpeedDial = styled(SpeedDial)(({ theme }) => ({
  '& .MuiSpeedDial-fab': {
    backgroundColor: '#240439', // Consider using theme.palette.primary.main or a custom color from the theme
    '&:hover': {
      backgroundColor: '#440080', // Consider using theme.palette.primary.dark or a custom color from the theme
    },
  },
}));