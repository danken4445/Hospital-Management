import { StyleSheet, Dimensions } from 'react-native';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export const styles = StyleSheet.create({
  // Portrait Styles
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginVertical: 10,
    marginHorizontal: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // Landscape Styles
  landscapeContainer: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  landscapeContent: {
    flex: 1,
    flexDirection: 'row',
  },
  landscapeSidebar: {
    width: 280,
    backgroundColor: '#fff',
    borderRightWidth: 1,
    borderRightColor: '#e0e0e0',
    paddingVertical: 10,
  },
  landscapeTabContainer: {
    paddingHorizontal: 15,
    paddingTop: 20,
  },
  landscapeMainContent: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  landscapeScrollView: {
    flex: 1,
    paddingHorizontal: 15,
  },
});