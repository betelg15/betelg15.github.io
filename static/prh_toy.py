import numpy as np

rng = np.random.default_rng(0)
N, k = 30, 4                       # 유한한 세계: 상태 30개, 임베딩 차원 4

def random_kernel(n):
    """대칭·비음수·행합 1인 '양성 쌍' 커널 (어떤 상태끼리 같은 것으로 묶이는가)"""
    A = rng.random((n, n)) ** 4
    A = (A + A.T) / 2
    return A / A.sum(axis=1, keepdims=True).mean()

def spectral_embedding(K, k):
    """화이트닝된 JEPA의 해 = 양성 쌍 커널의 상위 k개 고유벡터 (스펙트럴 임베딩)"""
    w, V = np.linalg.eigh((K + K.T) / 2)
    V = V[:, np.argsort(w)[::-1][:k]] * np.sqrt(len(K))   # 화이트닝 (공분산 = I)
    Q, _ = np.linalg.qr(rng.normal(size=(k, k)))           # 각 모델이 임의의 좌표계를 고른다고 가정
    return V @ Q

def procrustes_error(A, B):
    """A ≈ B R 이 되는 최적 직교행렬 R을 찾고, 남는 RMS 오차를 반환"""
    U, _, Vt = np.linalg.svd(B.T @ A)
    R = U @ Vt
    return np.sqrt(np.mean(np.sum((A - B @ R) ** 2, axis=1)))

world = random_kernel(N)
img = spectral_embedding(world, k)                  # '이미지 모델'
for eps in [0.0, 0.1, 0.3, 0.6]:
    mixed = (1 - eps) * world + eps * random_kernel(N)   # 양성 쌍이 어긋난 모델
    print(f"kernel mismatch eps={eps:.1f} -> rotation 후 RMS 오차 = "
          f"{procrustes_error(img, spectral_embedding(mixed, k)):.3f}")
