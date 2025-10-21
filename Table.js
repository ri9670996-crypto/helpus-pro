import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { 
    ChevronLeft, 
    ChevronRight, 
    ChevronsLeft, 
    ChevronsRight,
    Search,
    Filter,
    Download,
    Eye,
    Edit,
    Trash2,
    MoreVertical
} from 'lucide-react';

// Styled Components
const TableContainer = styled.div`
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
`;

const TableHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-bottom: 1px solid #f0f0f0;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
        align-items: stretch;
    }
`;

const TableTitle = styled.h3`
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
`;

const TableActions = styled.div`
    display: flex;
    align-items: center;
    gap: 12px;
    
    @media (max-width: 768px) {
        flex-direction: column;
    }
`;

const SearchBox = styled.div`
    position: relative;
    
    input {
        padding: 8px 12px 8px 36px;
        border: 1px solid #e0e0e0;
        border-radius: 8px;
        font-size: 14px;
        width: 250px;
        transition: all 0.3s ease;
        
        &:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
        
        @media (max-width: 768px) {
            width: 100%;
        }
    }
    
    svg {
        position: absolute;
        left: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #6c757d;
        width: 16px;
        height: 16px;
    }
`;

const ActionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 6px;
    padding: 8px 12px;
    border: 1px solid #e0e0e0;
    border-radius: 8px;
    background: white;
    color: #333;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: #f8f9fa;
        border-color: #667eea;
        color: #667eea;
    }
    
    &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
    }
`;

const TableWrapper = styled.div`
    overflow-x: auto;
`;

const StyledTable = styled.table`
    width: 100%;
    border-collapse: collapse;
    min-width: 800px;
`;

const TableHead = styled.thead`
    background: #f8f9fa;
    
    th {
        padding: 16px 12px;
        text-align: left;
        font-weight: 600;
        color: #6c757d;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        border-bottom: 1px solid #f0f0f0;
        cursor: pointer;
        user-select: none;
        transition: background 0.3s ease;
        
        &:hover {
            background: #e9ecef;
        }
        
        &.sortable {
            position: relative;
            
            &::after {
                content: '↕';
                margin-left: 4px;
                opacity: 0.5;
            }
            
            &.asc::after {
                content: '↑';
                opacity: 1;
            }
            
            &.desc::after {
                content: '↓';
                opacity: 1;
            }
        }
    }
`;

const TableBody = styled.tbody`
    tr {
        border-bottom: 1px solid #f0f0f0;
        transition: background 0.3s ease;
        
        &:last-child {
            border-bottom: none;
        }
        
        &:hover {
            background: #f8f9fa;
        }
    }
    
    td {
        padding: 16px 12px;
        font-size: 14px;
        color: #333;
        vertical-align: middle;
    }
`;

const StatusBadge = styled.span`
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    
    ${props => {
        switch (props.status) {
            case 'active':
                return `
                    background: #d4edda;
                    color: #155724;
                `;
            case 'pending':
                return `
                    background: #fff3cd;
                    color: #856404;
                `;
            case 'approved':
                return `
                    background: #d1ecf1;
                    color: #0c5460;
                `;
            case 'rejected':
                return `
                    background: #f8d7da;
                    color: #721c24;
                `;
            case 'completed':
                return `
                    background: #d4edda;
                    color: #155724;
                `;
            default:
                return `
                    background: #e9ecef;
                    color: #495057;
                `;
        }
    }}
`;

const AmountCell = styled.span`
    font-weight: 600;
    
    ${props => props.type === 'income' && `
        color: #28a745;
    `}
    
    ${props => props.type === 'expense' && `
        color: #dc3545;
    `}
`;

const ActionCell = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
    justify-content: flex-end;
`;

const IconButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: #6c757d;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover {
        background: #f8f9fa;
        color: #333;
        
        &.view { color: #667eea; background: rgba(102, 126, 234, 0.1); }
        &.edit { color: #28a745; background: rgba(40, 167, 69, 0.1); }
        &.delete { color: #dc3545; background: rgba(220, 53, 69, 0.1); }
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Pagination = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 24px;
    border-top: 1px solid #f0f0f0;
    
    @media (max-width: 768px) {
        flex-direction: column;
        gap: 16px;
    }
`;

const PaginationInfo = styled.div`
    font-size: 14px;
    color: #6c757d;
`;

const PaginationControls = styled.div`
    display: flex;
    align-items: center;
    gap: 8px;
`;

const PageButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 36px;
    height: 36px;
    padding: 0 8px;
    border: 1px solid #e0e0e0;
    border-radius: 6px;
    background: white;
    color: #333;
    font-size: 14px;
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
        background: #667eea;
        border-color: #667eea;
        color: white;
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
    
    &.active {
        background: #667eea;
        border-color: #667eea;
        color: white;
    }
`;

const EmptyState = styled.div`
    padding: 60px 20px;
    text-align: center;
    color: #6c757d;
    
    svg {
        width: 64px;
        height: 64px;
        margin-bottom: 16px;
        opacity: 0.5;
    }
    
    h4 {
        margin: 0 0 8px 0;
        font-size: 18px;
        font-weight: 600;
    }
    
    p {
        margin: 0;
        font-size: 14px;
    }
`;

// Main Table Component
const Table = ({
    columns = [],
    data = [],
    title = "Data Table",
    searchable = false,
    pagination = true,
    pageSize = 10,
    actions = ['view', 'edit', 'delete'],
    onAction,
    onSearch,
    loading = false,
    emptyMessage = "No data found",
    ...props
}) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });

    // Filter and sort data
    const processedData = useMemo(() => {
        let filteredData = data;

        // Apply search
        if (searchTerm && onSearch) {
            filteredData = onSearch(data, searchTerm);
        } else if (searchTerm) {
            filteredData = data.filter(item =>
                columns.some(col =>
                    String(item[col.key] || '').toLowerCase().includes(searchTerm.toLowerCase())
                )
            );
        }

        // Apply sorting
        if (sortConfig.key) {
            filteredData = [...filteredData].sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                
                if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }

        return filteredData;
    }, [data, searchTerm, sortConfig, columns, onSearch]);

    // Pagination
    const paginatedData = useMemo(() => {
        if (!pagination) return processedData;
        
        const startIndex = (currentPage - 1) * pageSize;
        return processedData.slice(startIndex, startIndex + pageSize);
    }, [processedData, currentPage, pageSize, pagination]);

    const totalPages = Math.ceil(processedData.length / pageSize);

    // Handlers
    const handleSort = (key) => {
        setSortConfig(current => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderCell = (item, column) => {
        const value = item[column.key];
        
        if (column.render) {
            return column.render(value, item);
        }
        
        switch (column.type) {
            case 'status':
                return <StatusBadge status={value}>{value}</StatusBadge>;
                
            case 'amount':
                return (
                    <AmountCell type={item.amount_type}>
                        {column.currency === 'BDT' ? `৳${value}` : `$${value}`}
                    </AmountCell>
                );
                
            case 'date':
                return new Date(value).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                });
                
            case 'actions':
                return (
                    <ActionCell>
                        {actions.includes('view') && (
                            <IconButton 
                                className="view"
                                onClick={() => onAction?.('view', item)}
                                title="View"
                            >
                                <Eye size={16} />
                            </IconButton>
                        )}
                        {actions.includes('edit') && (
                            <IconButton 
                                className="edit"
                                onClick={() => onAction?.('edit', item)}
                                title="Edit"
                            >
                                <Edit size={16} />
                            </IconButton>
                        )}
                        {actions.includes('delete') && (
                            <IconButton 
                                className="delete"
                                onClick={() => onAction?.('delete', item)}
                                title="Delete"
                            >
                                <Trash2 size={16} />
                            </IconButton>
                        )}
                    </ActionCell>
                );
                
            default:
                return value;
        }
    };

    if (loading) {
        return (
            <TableContainer>
                <div style={{ padding: '40px', textAlign: 'center', color: '#6c757d' }}>
                    Loading...
                </div>
            </TableContainer>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <TableContainer>
                {/* Table Header */}
                <TableHeader>
                    <TableTitle>{title}</TableTitle>
                    
                    <TableActions>
                        {searchable && (
                            <SearchBox>
                                <Search size={16} />
                                <input
                                    type="text"
                                    placeholder="Search..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearch(e.target.value)}
                                />
                            </SearchBox>
                        )}
                        
                        <ActionButton>
                            <Filter size={16} />
                            Filter
                        </ActionButton>
                        
                        <ActionButton>
                            <Download size={16} />
                            Export
                        </ActionButton>
                    </TableActions>
                </TableHeader>

                {/* Table Content */}
                <TableWrapper>
                    <StyledTable>
                        <TableHead>
                            <tr>
                                {columns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={column.sortable ? `sortable ${sortConfig.key === column.key ? sortConfig.direction : ''}` : ''}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                        style={{ width: column.width }}
                                    >
                                        {column.title}
                                    </th>
                                ))}
                            </tr>
                        </TableHead>
                        
                        <TableBody>
                            {paginatedData.length > 0 ? (
                                paginatedData.map((item, index) => (
                                    <tr key={item.id || index}>
                                        {columns.map((column) => (
                                            <td key={column.key}>
                                                {renderCell(item, column)}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={columns.length}>
                                        <EmptyState>
                                            <Search size={64} />
                                            <h4>No Data</h4>
                                            <p>{emptyMessage}</p>
                                        </EmptyState>
                                    </td>
                                </tr>
                            )}
                        </TableBody>
                    </StyledTable>
                </TableWrapper>

                {/* Pagination */}
                {pagination && processedData.length > 0 && (
                    <Pagination>
                        <PaginationInfo>
                            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, processedData.length)} of {processedData.length} entries
                        </PaginationInfo>
                        
                        <PaginationControls>
                            <PageButton
                                onClick={() => handlePageChange(1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronsLeft size={16} />
                            </PageButton>
                            
                            <PageButton
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                            >
                                <ChevronLeft size={16} />
                            </PageButton>
                            
                            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                const page = i + 1;
                                return (
                                    <PageButton
                                        key={page}
                                        onClick={() => handlePageChange(page)}
                                        className={currentPage === page ? 'active' : ''}
                                    >
                                        {page}
                                    </PageButton>
                                );
                            })}
                            
                            <PageButton
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronRight size={16} />
                            </PageButton>
                            
                            <PageButton
                                onClick={() => handlePageChange(totalPages)}
                                disabled={currentPage === totalPages}
                            >
                                <ChevronsRight size={16} />
                            </PageButton>
                        </PaginationControls>
                    </Pagination>
                )}
            </TableContainer>
        </motion.div>
    );
};

export default Table;