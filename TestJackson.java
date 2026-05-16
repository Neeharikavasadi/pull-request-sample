
import com.fasterxml.jackson.databind.ObjectMapper;

public class TestJackson {
    static class AuthResponse {
        private Long userId;
        public AuthResponse(Long userId) { this.userId = userId; }
        public Long getUserId() { return userId; }
    }
    public static void main(String[] args) throws Exception {
        System.out.println(new ObjectMapper().writeValueAsString(new AuthResponse(1L)));
    }
}
