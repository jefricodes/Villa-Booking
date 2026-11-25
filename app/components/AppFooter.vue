
<template>
  <footer class="footer">
    <div class="footer-container">

      <div>
        <h3>VILLA<span>STAY</span></h3>

        <p>
          Your peaceful escape starts here.
          Discover comfort, privacy, and beautiful stays.
        </p>
      </div>

      <div class="footer-links">
        <NuxtLink to="/">Home</NuxtLink>
        <NuxtLink to="#villas">Our Villas</NuxtLink>
        <NuxtLink to="#facilities">Facilities</NuxtLink>
        <NuxtLink to="#booking">Contact</NuxtLink>
      </div>

    </div>

    <div class="footer-bottom">
      © 2026 VillaStay. All rights reserved.
    </div>
  </footer>
</template>

<style scoped>
.footer {
  margin-top: 80px;
  padding: 55px 24px 20px;
  color: white;
  background: #183d32;
}

.footer-container {
  max-width: 1150px;
  margin: auto;
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 40px;
}

.footer h3 {
  font-size: 22px;
  letter-spacing: 1px;
}

.footer h3 span {
  color: #c6a47a;
  font-weight: 400;
}

.footer-container p {
  max-width: 350px;
  color: #c0cec5;
  font-size: 13px;
  line-height: 1.8;
}

.footer-links {
  display: flex;
  gap: 25px;
  flex-wrap: wrap;
}

.footer-links a {
  color: #d7e1db;
  text-decoration: none;
  font-size: 13px;
}

.footer-bottom {
  max-width: 1150px;
  margin: 45px auto 0;
  padding-top: 20px;
  border-top: 1px solid #466357;
  color: #b8c8be;
  text-align: center;
  font-size: 12px;
}

@media (max-width: 600px) {
  .footer-container {
    flex-direction: column;
  }
}
</style>
