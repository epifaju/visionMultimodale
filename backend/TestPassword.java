import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class TestPassword {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        String password = "demo123";
        String encoded = encoder.encode(password);
        System.out.println("Password: " + password);
        System.out.println("Encoded: " + encoded);
        
        // Test de vérification
        boolean matches = encoder.matches(password, encoded);
        System.out.println("Matches: " + matches);
    }
}
