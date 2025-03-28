
import React from 'react';
import styled from 'styled-components';

const SearchBar = ({ searchTerm, setSearchTerm })  => {
  return (
    <div class="input-container">
        <input
            type="text"
            placeholder="Search by Unique ID or Name"
            value={searchTerm}
            class="input-field" 
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ marginBottom: "10px", padding: "5px", width: "200px" 
                
            }}
        />         
  </div>
  
  );
}



export default SearchBar;

