import React from 'react';
import { styled } from '@mui/material/styles';
import ArrowForwardIosSharpIcon from '@mui/icons-material/ArrowForwardIosSharp';
import MuiAccordion from '@mui/material/Accordion';
import MuiAccordionSummary from '@mui/material/AccordionSummary';
import MuiAccordionDetails from '@mui/material/AccordionDetails';
import Typography from '@mui/material/Typography';
import MenuItemCard from './MenuItemCard';

const Accordion = styled((props) => (
  <MuiAccordion disableGutters elevation={0} square {...props} />
))(({ theme }) => ({
  border: `0.5px solid ${theme.palette.divider}`,
  '&:before': {
    display: 'none',
  },
  marginBottom: '10px',
  borderRadius: '12px',
}));

const AccordionSummary = styled((props) => (
  <MuiAccordionSummary
    expandIcon={<ArrowForwardIosSharpIcon sx={{ fontSize: '0.9rem' }} />}
    {...props}
  />
))(({ theme }) => ({
  backgroundColor: 'white',
  borderRadius: '12px',
  flexDirection: 'row',
  '& .MuiAccordionSummary-expandIconWrapper.Mui-expanded': {
    transform: 'rotate(90deg)',
  },
  '& .MuiAccordionSummary-content': {
    marginLeft: theme.spacing(1),
  },
}));

const AccordionDetails = styled(MuiAccordionDetails)(({ theme }) => ({
  padding: theme.spacing(0.3),
  borderTop: '1px solid rgba(0, 0, 0, .05)',
}));

const MenuSection = ({ title, items, expanded, onChange, defaultExpanded = false }) => {
  return (
    <Accordion
      expanded={expanded}
      onChange={onChange}
      defaultExpanded={defaultExpanded}
    >
      <AccordionSummary className='active:scale-99 transition-all duration-400'>
        <div className="flex items-center gap-2">
          <Typography className={title === "Recommended Items" ? "text-[#FF583A] font-medium" : ""}>
            {title} <span className="text-gray-500 text-sm">({items.length})</span>
          </Typography>
        </div>
      </AccordionSummary>
      <AccordionDetails>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-1.5">
          {items.map((item) => (
            <MenuItemCard key={item.itemid} item={item} />
          ))}
        </div>
      </AccordionDetails>
    </Accordion>
  );
};

export default MenuSection; 