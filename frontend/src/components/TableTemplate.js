import React, { useState } from 'react'
import { StyledTableCell, StyledTableRow } from './styles';
import { Table, TableBody, TableContainer, TableHead, TablePagination, Paper, Box } from '@mui/material';
import styled from 'styled-components';

const TableTemplate = ({ buttonHaver: ButtonHaver, columns, rows }) => {
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(5);
    
    return (
        <RootContainer elevation={0}>
            <TableContainer sx={{ borderRadius: '24px' }}>
                <Table stickyHeader aria-label="sticky table">
                    <TableHead>
                        <StyledTableRow>
                            {columns.map((column) => (
                                <StyledTableCell
                                    key={column.id}
                                    align={column.align}
                                    style={{ minWidth: column.minWidth }}
                                >
                                    {column.label}
                                </StyledTableCell>
                            ))}
                            <StyledTableCell align="center">
                                Actions
                            </StyledTableCell>
                        </StyledTableRow>
                    </TableHead>
                    <TableBody>
                        {rows
                            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                            .map((row) => {
                                return (
                                    <StyledTableRow hover role="checkbox" tabIndex={-1} key={row.id}>
                                        {columns.map((column) => {
                                            const value = row[column.id];
                                            return (
                                                <StyledTableCell key={column.id} align={column.align}>
                                                    {
                                                        column.format && typeof value === 'number'
                                                            ? column.format(value)
                                                            : value
                                                    }
                                                </StyledTableCell>
                                            );
                                        })}
                                        <StyledTableCell align="center">
                                            <ButtonHaver row={row} />
                                        </StyledTableCell>
                                    </StyledTableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </TableContainer>
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                <StyledPagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={(event, newPage) => setPage(newPage)}
                    onRowsPerPageChange={(event) => {
                        setRowsPerPage(parseInt(event.target.value, 10));
                        setPage(0);
                    }}
                />
            </Box>
        </RootContainer>
    )
}

export default TableTemplate

const RootContainer = styled(Paper)`
  border-radius: 24px !important;
  border: 1px solid var(--border) !important;
  overflow: hidden;
  background: rgba(176, 168, 185, 0.03) !important;
  backdrop-filter: blur(10px);
  box-shadow: var(--shadow-md) !important;
  animation: fadeIn 0.6s ease-out;
`;

const StyledPagination = styled(TablePagination)`
  color: var(--text-muted) !important;
  & .MuiTablePagination-selectIcon { color: var(--text-muted); }
  & .MuiTablePagination-actions { color: var(--text-muted); }
  & .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows {
    font-family: 'Inter';
    font-weight: 500;
  }
`;