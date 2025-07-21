import React, { memo } from 'react';
import { Card, Button, Searchbar, Surface, Chip } from 'react-native-paper';
import { View, StyleSheet, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const MedicinesUsedCard = memo(({ data, onScan, offline }) => {
  const [searchQuery, setSearchQuery] = React.useState('');
  const [isExpanded, setIsExpanded] = React.useState(false);
  const medicinesData = Array.isArray(data) ? data : [];

  const renderUsedItems = () => {
    const filteredItems = medicinesData.filter(item =>
      item.name && item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredItems.length === 0) {
      return (
        <View style={styles.emptyState}>
          <Icon name="pill" size={48} color="#dc3545" />
          <Text style={styles.emptyText}>
            {searchQuery ? 'No matching medicines found' : 'No medicines used yet'}
          </Text>
          <Text style={styles.emptySubtext}>
            Scan a medicine QR code to add it to this list
          </Text>
        </View>
      );
    }

    // Show only first 5 items when collapsed
    const itemsToShow = isExpanded ? filteredItems : filteredItems.slice(0, 5);

    return (
      <View style={styles.itemsContainer}>
        <ScrollView 
          style={[styles.itemsList, !isExpanded && styles.collapsedList]} 
          showsVerticalScrollIndicator={true}
          nestedScrollEnabled={true}
        >
          {itemsToShow.map((item, index) => (
            <Surface key={`medicine-${item.id || index}-${item.timestamp || index}`} style={styles.itemCard} elevation={2}>
              <View style={styles.itemContent}>
                <View style={styles.itemLeft}>
                  <View style={styles.itemIcon}>
                    <Icon name="pill" size={20} color="#dc3545" />
                  </View>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName} numberOfLines={2}>{item.name || 'Unknown Medicine'}</Text>
                    <Text style={styles.itemDescription} numberOfLines={2}>{item.standardDesc || 'No description'}</Text>
                    {item.shortDesc && (
                      <Text style={styles.itemShortDesc} numberOfLines={1}>{item.shortDesc}</Text>
                    )}
                  </View>
                </View>
                
                <View style={styles.itemRight}>
                  <Chip 
                    mode="flat" 
                    compact 
                    style={styles.quantityChip}
                    textStyle={styles.quantityText}
                  >
                    <Text style={styles.quantityText}>×{item.quantity || 0}</Text>
                  </Chip>
                  {item.offline && (
                    <Icon name="cloud-off-outline" size={14} color="#ff9800" />
                  )}
                </View>
              </View>

              {/* Additional details - shown only when expanded */}
              {isExpanded && (item.timestamp || item.retailPrice > 0) && (
                <View style={styles.expandedDetails}>
                  {item.timestamp && (
                    <View style={styles.detailRow}>
                      <Icon name="clock-outline" size={14} color="#666" />
                      <Text style={styles.detailText}>{new Date(item.timestamp).toLocaleString()}</Text>
                    </View>
                  )}
                  {item.retailPrice > 0 && (
                    <View style={styles.detailRow}>
                      <Icon name="currency-usd" size={14} color="#4caf50" />
                      <Text style={[styles.detailText, styles.priceText]}>₱{item.retailPrice.toFixed(2)}</Text>
                    </View>
                  )}
                </View>
              )}
            </Surface>
          ))}
        </ScrollView>

        {/* Show expand/collapse button if there are more than 5 items */}
        {filteredItems.length > 5 && (
          <View style={styles.expandButton}>
            <Button
              mode="text"
              compact
              onPress={() => setIsExpanded(!isExpanded)}
              icon={isExpanded ? "chevron-up" : "chevron-down"}
              labelStyle={styles.expandButtonText}
            >
              <Text style={styles.expandButtonText}>
                {isExpanded ? 'Show Less' : `Show All (${filteredItems.length})`}
              </Text>
            </Button>
          </View>
        )}
      </View>
    );
  };

  return (
    <Card style={styles.mainCard} elevation={4}>
      {/* Header */}
      <View style={styles.headerSection}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <View style={styles.headerIcon}>
              <Icon name="pill" size={28} color="#ffffff" />
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>Medicines Used</Text>
              <Text style={styles.headerSubtitle}>
                {medicinesData.length} {medicinesData.length === 1 ? 'item' : 'items'} • Pharmaceutical inventory
              </Text>
            </View>
          </View>
          
          <View style={styles.headerRight}>
            {offline && (
              <View style={styles.offlineIndicator}>
                <Icon name="cloud-off-outline" size={16} color="#ffffff" />
                <Text style={styles.offlineText}>Offline</Text>
              </View>
            )}
          </View>
        </View>
      </View>

      <View style={styles.cardContent}>
        {/* Search - show when has items */}
        {medicinesData.length > 0 && (
          <View style={styles.searchContainer}>
            <Searchbar
              placeholder="Search medicines by name or description..."
              onChangeText={setSearchQuery}
              value={searchQuery}
              style={styles.searchbar}
              inputStyle={styles.searchInput}
              iconColor="#dc3545"
              theme={{ colors: { primary: '#dc3545' } }}
            />
          </View>
        )}

        {/* Content Container */}
        <View style={styles.contentContainer}>
          {renderUsedItems()}
        </View>

        {/* Action Section */}
        <View style={styles.actionContainer}>
          <Button
            mode="contained"
            onPress={() => onScan('medicines')}
            style={[styles.scanButton, offline && styles.offlineButton]}
            icon="barcode-scan"
            disabled={offline}
            labelStyle={styles.buttonLabel}
            contentStyle={styles.buttonContent}
          >
            <Text style={styles.buttonText}>
              {offline ? 'Offline - Cannot Scan' : 'Scan Medicine QR Code'}
            </Text>
          </Button>
        </View>

        {/* Offline Notice */}
        {offline && (
          <View style={styles.offlineNotice}>
            <Icon name="information-outline" size={16} color="#ff9800" />
            <Text style={styles.offlineNoticeText}>
              You're in offline mode. Scanned items will be saved locally and synced when connected to the internet.
            </Text>
          </View>
        )}
      </View>
    </Card>
  );
});

const styles = StyleSheet.create({
  mainCard: {
    marginBottom: 20,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#ffebee',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  headerSection: {
    backgroundColor: '#dc3545',
    paddingBottom: 4,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 18,
  },
  headerRight: {
    alignItems: 'center',
  },
  offlineIndicator: {
    backgroundColor: 'rgba(255, 152, 0, 0.9)',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  offlineText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  cardContent: {
    flex: 1,
  },
  searchContainer: {
    padding: 16,
    backgroundColor: '#fafafa',
  },
  searchbar: {
    borderRadius: 12,
    backgroundColor: '#ffffff',
    elevation: 2,
    height: 48,
  },
  searchInput: {
    fontSize: 16,
    minHeight: 0,
  },
  contentContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
    minHeight: 200,
    maxHeight: 500, // Increased maximum height
  },
  itemsContainer: {
    flex: 1,
  },
  itemsList: {
    flexGrow: 1,
  },
  collapsedList: {
    maxHeight: 300, // Increased collapsed height
  },
  itemCard: {
    marginBottom: 12,
    borderRadius: 12,
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  itemContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 12,
  },
  itemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#ffebee',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
    lineHeight: 22,
  },
  itemDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    lineHeight: 20,
  },
  itemShortDesc: {
    fontSize: 12,
    color: '#999',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  itemRight: {
    alignItems: 'center',
    gap: 8,
  },
  quantityChip: {
    backgroundColor: '#dc3545',
    height: 28,
    minWidth: 40,
  },
  quantityText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 13,
  },
  expandedDetails: {
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    gap: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailText: {
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  priceText: {
    color: '#4caf50',
    fontWeight: '600',
  },
  expandButton: {
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  expandButtonText: {
    fontSize: 14,
    color: '#dc3545',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
    gap: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontWeight: '600',
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    lineHeight: 20,
  },
  actionContainer: {
    padding: 16,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  scanButton: {
    backgroundColor: '#dc3545',
    borderRadius: 12,
    height: 50,
    elevation: 3,
  },
  offlineButton: {
    backgroundColor: '#bdbdbd',
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  buttonContent: {
    height: 50,
    paddingVertical: 0,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  offlineNotice: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff3cd',
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffeaa7',
  },
  offlineNoticeText: {
    fontSize: 13,
    color: '#856404',
    flex: 1,
    lineHeight: 18,
  },
});

export default MedicinesUsedCard;