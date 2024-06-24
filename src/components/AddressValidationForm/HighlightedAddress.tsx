import React from 'react';
import { HighlightedAddressProps } from './types';

export const HighlightedAddress: React.FC<HighlightedAddressProps> = ({ userAddress, validatedAddress }) => {
    const highlightDifferences = (str1: string, str2: string) => {
      const words1 = str1.split(' ');
      const words2 = str2.split(' ');
      return (
        <span>
          {words2.map((word, index) => {
            const isHighlighted = word.toLowerCase() !== words1[index]?.toLowerCase();
            return (
              <span key={index} className={isHighlighted ? 'highlight-diff' : ''}>
                {word}
                {index < words2.length - 1 ? ' ' : ''}
              </span>
            );
          })}
        </span>
      );
    };
  
    return (
      <div>
        <p>
          {highlightDifferences(userAddress.street, validatedAddress.street)}
          {(userAddress.aptSuite || validatedAddress.aptSuite) && (
            <>
              {' '}
              {highlightDifferences(userAddress.aptSuite || '', validatedAddress.aptSuite || '')}
            </>
          )}
          {', '}
          {highlightDifferences(userAddress.city, validatedAddress.city)}
          {', '}
          {highlightDifferences(userAddress.state, validatedAddress.state)}
          {' '}
          {highlightDifferences(userAddress.zip, validatedAddress.zip)}
          {', USA'}
        </p>
      </div>
    );
  };