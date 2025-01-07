const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#fcfcf2',
      justifyContent: 'center',
      alignItems: 'center',
    },
    image: {
      height: 10,
      width: 10,
    },
    header: {
      width: 90,
      height: 130,
    },
    imageMargin: {
      height: 2,
      marginTop: '1%',
      backgroundColor: '#C5C5BC',
      width: '45%',
    },
    searchBarContainer: {
      paddingHorizontal: 20,
      paddingVertical: 10,
      width: '100%',
    },
    searchInput: {
      height: 40,
      marginTop: 8,
      backgroundColor: '#fff',
      paddingHorizontal: 10,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: '#C5C5BC',
      fontSize: 16,
    },
    contentContainer: {
      flexGrow: 1,
    },
    content: {
      padding: 20,
    },
    bottomIcons: {
      borderWidth: 1,
      borderColor: '#C5C5BC',
      flexDirection: 'row',
      justifyContent: 'space-around',
      alignItems: 'center',
      backgroundColor: '#fcfcf2',
      paddingVertical: 10,
      width: '100%',
    },
    iconContainer: {
      alignItems: 'center',
    },
    card: {
      backgroundColor: '#fff',
      padding: 16,
      marginBottom: 16,
      borderRadius: 8,
      shadowColor: '#000',
      shadowOpacity: 0.1,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      width: '90%',
      maxWidth: 410, 
      alignSelf: 'center',
    },
    
    text: {
      fontSize: 16,
      fontWeight: 'bold',
      textAlign: 'center',
    },
    
    imageCard: {
      width: '100%',
      height: 160,
      marginBottom: 12,
    },
});

export default styles;