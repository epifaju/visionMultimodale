import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        // Test the stored hash from data.sql
        String storedHash = "$2a$10$8.UnVuG9HHgffUDAlk8qfOuVGkqRzgVymGe07xd00DMxs.AQubh4a";
        String testPassword = "user123";
        
        boolean matches = encoder.matches(testPassword, storedHash);
        System.out.println("Password 'user123' matches stored hash: " + matches);
        
        // Generate a new hash for comparison
        String newHash = encoder.encode(testPassword);
        System.out.println("New hash for 'user123': " + newHash);
        System.out.println("New hash matches: " + encoder.matches(testPassword, newHash));
    }
}
